import fsP from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';

import { parse } from '@babel/parser';
const traverse = require('@babel/traverse').default || require('@babel/traverse');
import MagicString from 'magic-string';

import { REPLACEMENTS, EMOJI_PATTERN, reverseEmojiMojibake } from '../1-atoms/constants';
import type { SanitizeOptions, FileSanitizeResult } from '../1-atoms/types';

// ─────────────────────────────────────────────────────────────────────────────
// Archivos de codigo fuente: se activa el pipeline AST.
// Resto de extensiones: procesador plano (regex global sin riesgo de romper
// delimitadores de lenguaje).
// ─────────────────────────────────────────────────────────────────────────────
const CODE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.astro', '.mjs', '.cjs']);

// ─────────────────────────────────────────────────────────────────────────────
// KERNEL DE REGLAS DE ENTROPIA
// Recibe un fragmento de texto YA AISLADO (interior de un string/comentario)
// y aplica las transformaciones sin tocar delimitadores del lenguaje.
// ─────────────────────────────────────────────────────────────────────────────
function applyEntropyRules(raw: string, rules: Record<string, boolean>): { fixed: string; count: number } {
    let fixed = raw;
    let count = 0;

    if (rules.mojibake) {
        for (const [bad, good] of Object.entries(REPLACEMENTS)) {
            const c = fixed.split(bad).length - 1;
            if (c > 0) { fixed = fixed.replaceAll(bad, good); count += c; }
        }
    }
    if (rules.emojis) {
        fixed = fixed.replace(EMOJI_PATTERN, (match: string) => {
            const r = reverseEmojiMojibake(match);
            if (r !== match) { count++; return r; }
            return match;
        });
    }
    if (rules.smartQuotes) {
        // Comillas dobles tipograficas
        const dq = (fixed.match(/[“”]/g) || []).length;
        if (dq > 0) { fixed = fixed.replace(/[“”]/g, '"'); count += dq; }
        // Comillas simples / apostrofes curvos
        // SEGURO aqui porque operamos sobre el INTERIOR de un nodo ya delimitado.
        const sq = (fixed.match(/[‘’]/g) || []).length;
        if (sq > 0) { fixed = fixed.replace(/[‘’]/g, '''); count += sq; }
    }
    if (rules.zeroWidth) {
        const inv = /[​‌‍‪-‮⁦-⁩]/g;
        const c = (fixed.match(inv) || []).length;
        if (c > 0) { fixed = fixed.replace(inv, ''); count += c; }
    }
    return { fixed, count };
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESADOR DE CODIGO — AST + MagicString
// ─────────────────────────────────────────────────────────────────────────────
async function processCodeFile(
    filepath: string,
    content: string,
    rules: Record<string, boolean>,
    audit: boolean,
    gitStage: boolean
): Promise<FileSanitizeResult> {
    let corruptions = 0;

    try {
        const ms = new MagicString(content);

        const ast = parse(content, {
            sourceType: 'unambiguous',
            errorRecovery: true,
            plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
        });

        traverse(ast, {
            StringLiteral({ node }: any) {
                // Operamos SOLO sobre el interior: [start+1 .. end-1] (excluye comillas)
                const inner = content.slice(node.start + 1, node.end - 1);
                const { fixed, count } = applyEntropyRules(inner, rules);
                if (count > 0 && fixed !== inner) {
                    ms.overwrite(node.start + 1, node.end - 1, fixed);
                    corruptions += count;
                }
            },
            TemplateLiteral({ node }: any) {
                // Cada segmento estatico (quasis) se procesa de forma independiente
                for (const quasi of (node as any).quasis) {
                    const raw = quasi.value.raw as string;
                    const { fixed, count } = applyEntropyRules(raw, rules);
                    if (count > 0 && fixed !== raw) {
                        const s = quasi.start + 1;
                        const e = quasi.end - 1;
                        if (s < e) { ms.overwrite(s, e, fixed); corruptions += count; }
                    }
                }
            },
        });

        // Comentarios (disponibles en ast.comments, fuera del traversal estandar)
        for (const comment of ((ast as any).comments || [])) {
            const raw: string = comment.value;
            const { fixed, count } = applyEntropyRules(raw, rules);
            if (count > 0 && fixed !== raw) {
                const offset = 2; // Longitud de // o /*
                const endOffset = comment.type === 'CommentBlock' ? 2 : 0; // Longitud de */
                const s = comment.start + offset;
                const e = comment.end - endOffset;
                if (s < e) { ms.overwrite(s, e, fixed); corruptions += count; }
            }
        }

        // Erradicador de produccion: opera sobre el resultado final del AST
        let finalContent = ms.toString();
        if (rules.eradicator) {
            const consoleRx = /^[ 	]*console.(log|info|debug|warn)(.*?);?[ 	]*?
?/gm;
            const debugRx   = /^[ 	]*debugger;[ 	]*?
?/gm;
            const todoRx    = /^[ 	]*// ?TODO:.*??
?/gmi;

            const cc = (finalContent.match(consoleRx) || []).length;
            if (cc > 0) { finalContent = finalContent.replace(consoleRx, ''); corruptions += cc; }
            const dc = (finalContent.match(debugRx) || []).length;
            if (dc > 0) { finalContent = finalContent.replace(debugRx, ''); corruptions += dc; }
            const tc = (finalContent.match(todoRx) || []).length;
            if (tc > 0) { finalContent = finalContent.replace(todoRx, ''); corruptions += tc; }
        }

        if (corruptions > 0) {
            if (!audit) {
                await fsP.writeFile(filepath, finalContent, 'utf8');
                if (gitStage) {
                    try { execSync(`git add "${filepath}"`, { cwd: path.dirname(filepath), stdio: 'ignore' }); } catch (_) {}
                }
            }
            return { filepath, corruptions, modified: true, originalContent: content };
        }
        return { filepath, corruptions: 0, modified: false };

    } catch (_parseError) {
        // Fallback: el archivo no pudo parsearse (JS invalido previo), modo plano sin riesgo.
        return processPlainFile(filepath, content, rules, audit, gitStage);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESADOR PLANO — Regex global.
// Markdown, JSON, CSS, PHP, TXT, etc. Sin sintaxis de lenguaje que romper.
// ─────────────────────────────────────────────────────────────────────────────
async function processPlainFile(
    filepath: string,
    content: string,
    rules: Record<string, boolean>,
    audit: boolean,
    gitStage: boolean
): Promise<FileSanitizeResult> {
    let modified = content;
    let corruptions = 0;

    if (rules.mojibake) {
        for (const [bad, good] of Object.entries(REPLACEMENTS)) {
            const c = modified.split(bad).length - 1;
            if (c > 0) { modified = modified.replaceAll(bad, good); corruptions += c; }
        }
    }
    if (rules.emojis) {
        modified = modified.replace(EMOJI_PATTERN, (match: string) => {
            const r = reverseEmojiMojibake(match);
            if (r !== match) { corruptions++; return r; }
            return match;
        });
    }

    // BOM estandar al inicio
    if (modified.charCodeAt(0) === 0xFEFF) { modified = modified.slice(1); corruptions++; }
    // BOM fantasma en medio del contenido
    const ghostBom = (modified.match(/ï»¿/g) || []).length;
    if (ghostBom > 0) { modified = modified.replace(/ï»¿/g, ''); corruptions += ghostBom; }

    if (rules.smartQuotes) {
        const dq = (modified.match(/[“”]/g) || []).length;
        if (dq > 0) { modified = modified.replace(/[“”]/g, '"'); corruptions += dq; }
        const sq = (modified.match(/[‘’]/g) || []).length;
        if (sq > 0) { modified = modified.replace(/[‘’]/g, '''); corruptions += sq; }
    }
    if (rules.zeroWidth) {
        const inv = /[​‌‍‪-‮⁦-⁩]/g;
        const c = (modified.match(inv) || []).length;
        if (c > 0) { modified = modified.replace(inv, ''); corruptions += c; }
        const nbsp = (modified.match(/ /g) || []).length;
        if (nbsp > 0) { modified = modified.replace(/ /g, ' '); corruptions += nbsp; }
    }
    if (rules.crlf) {
        const c = (modified.match(/
/g) || []).length;
        if (c > 0) { modified = modified.replace(/
/g, '
'); corruptions += c; }
    }

    if (modified !== content) {
        if (!audit) {
            await fsP.writeFile(filepath, modified, 'utf8');
            if (gitStage) {
                try { execSync(`git add "${filepath}"`, { cwd: path.dirname(filepath), stdio: 'ignore' }); } catch (_) {}
            }
        }
        return { filepath, corruptions, modified: true, originalContent: content };
    }
    return { filepath, corruptions: 0, modified: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPATCHER PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export async function processFile(filepath: string, options: SanitizeOptions): Promise<FileSanitizeResult> {
    try {
        const content = await fsP.readFile(filepath, 'utf8');
        const ext = path.extname(filepath).toLowerCase();
        const rules = options.config.rules;

        if (CODE_EXTENSIONS.has(ext)) {
            return processCodeFile(filepath, content, rules, options.audit, options.gitStage ?? false);
        } else {
            return processPlainFile(filepath, content, rules, options.audit, options.gitStage ?? false);
        }
    } catch (_) {
        return { filepath, corruptions: 0, modified: false };
    }
}
