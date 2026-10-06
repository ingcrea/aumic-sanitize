import fsP from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';

import { parse } from '@babel/parser';
const traverse = require('@babel/traverse').default || require('@babel/traverse');
import MagicString from 'magic-string';

import { EMOJI_PATTERN, reverseEmojiMojibake } from '../1-atoms/constants';
import { MojibakeEngine } from '../2-molecules/MojibakeEngine';
import type { SanitizeOptions, FileSanitizeResult } from '../1-atoms/types';
import { detectProfile, isBinaryOrIgnored } from '../2-molecules/LanguageProfiler';
import type { LanguageProfile, SmartQuoteMode } from '../2-molecules/LanguageProfiler';

// ─────────────────────────────────────────────────────────────────────────────
// KERNEL DE REGLAS DE ENTROPIA
// Recibe un fragmento de texto YA AISLADO y aplica las transformaciones.
// El modo de smart quotes se decide fuera de esta funcion por el perfil.
// ─────────────────────────────────────────────────────────────────────────────
function applyEntropyRules(
    raw: string,
    rules: Record<string, boolean>,
    profile: LanguageProfile,
    insideString: boolean = false  // true = llamado desde un nodo AST o string-regex
): { fixed: string; count: number } {
    let fixed = raw;
    let count = 0;

    if (rules.mojibake && profile.allowMojibake) {
        const { fixed: f, count: c } = MojibakeEngine.cure(fixed, profile.allowedMojibakeVectors);
        if (c > 0) { fixed = f; count += c; }
    }

    if (rules.emojis) {
        fixed = fixed.replace(EMOJI_PATTERN, (match: string) => {
            const r = reverseEmojiMojibake(match);
            if (r !== match) { count++; return r; }
            return match;
        });
    }

    if (rules.smartQuotes) {
        const mode = profile.smartQuoteMode;
        const canTouch = mode === 'global' || (insideString && (mode === 'ast-only' || mode === 'string-regex'));

        if (canTouch) {
            // Comillas dobles tipograficas — siempre seguras en cualquier contexto
            const dq = (fixed.match(/[\u201C\u201D]/g) || []).length;
            if (dq > 0) { fixed = fixed.replace(/[\u201C\u201D]/g, '\x22'); count += dq; }

            // Comillas simples / apostrofes — SOLO si estamos dentro de un string aislado
            // o en modo global (archivos planos donde no hay delimitadores de lenguaje)
            if (insideString || mode === 'global') {
                const sq = (fixed.match(/[\u2018\u2019]/g) || []).length;
                if (sq > 0) { fixed = fixed.replace(/[\u2018\u2019]/g, '\x27'); count += sq; }
            }
        }
    }

    if (rules.zeroWidth && profile.allowZeroWidth) {
        const inv = /[\u200B\u200C\u200D\u202A-\u202E\u2066-\u2069]/g;
        const c = (fixed.match(inv) || []).length;
        if (c > 0) { fixed = fixed.replace(inv, ''); count += c; }
    }

    return { fixed, count };
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESADOR AST (JS / TS)
// Usa Babel para parsear el arbol sintactico y operar SOLO sobre nodos
// de tipo StringLiteral, TemplateLiteral.quasis y Comment.
// ─────────────────────────────────────────────────────────────────────────────
async function processWithAST(
    filepath: string,
    content: string,
    rules: Record<string, boolean>,
    profile: LanguageProfile,
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
                const inner = content.slice(node.start + 1, node.end - 1);
                const { fixed, count } = applyEntropyRules(inner, rules, profile, true);
                if (count > 0 && fixed !== inner) {
                    ms.overwrite(node.start + 1, node.end - 1, fixed);
                    corruptions += count;
                }
            },
            TemplateLiteral({ node }: any) {
                for (const quasi of (node as any).quasis) {
                    const raw = quasi.value.raw as string;
                    const { fixed, count } = applyEntropyRules(raw, rules, profile, true);
                    if (count > 0 && fixed !== raw) {
                        const s = quasi.start + 1;
                        const e = quasi.end - 1;
                        if (s < e) { ms.overwrite(s, e, fixed); corruptions += count; }
                    }
                }
            },
        });

        // Comentarios (en ast.comments, fuera del traversal estandar)
        for (const comment of ((ast as any).comments || [])) {
            const raw: string = comment.value;
            const { fixed, count } = applyEntropyRules(raw, rules, profile, true);
            if (count > 0 && fixed !== raw) {
                const s = comment.start + 2;
                const e = comment.end - (comment.type === 'CommentBlock' ? 2 : 0);
                if (s < e) { ms.overwrite(s, e, fixed); corruptions += count; }
            }
        }

        // Eradicador (solo si el perfil lo permite)
        let finalContent = ms.toString();
        if (rules.eradicator && profile.allowEradicator) {
            const consoleRx = /^[ \t]*console\.(log|info|debug|warn)\(.*?\);?[ \t]*\r?\n?/gm;
            const debugRx   = /^[ \t]*debugger;[ \t]*\r?\n?/gm;
            const todoRx    = /^[ \t]*\/\/ ?TODO:.*?\r?\n?/gmi;
            const cc = (finalContent.match(consoleRx) || []).length;
            if (cc > 0) { finalContent = finalContent.replace(consoleRx, ''); corruptions += cc; }
            const dc = (finalContent.match(debugRx) || []).length;
            if (dc > 0) { finalContent = finalContent.replace(debugRx, ''); corruptions += dc; }
            const tc = (finalContent.match(todoRx) || []).length;
            if (tc > 0) { finalContent = finalContent.replace(todoRx, ''); corruptions += tc; }
        }

        // CRLF (nivel de archivo, no de nodo)
        if (rules.crlf && profile.allowCRLF) {
            const c = (finalContent.match(/\r\n/g) || []).length;
            if (c > 0) { finalContent = finalContent.replace(/\r\n/g, '\n'); corruptions += c; }
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
        // Fallback: el archivo no pudo parsearse — modo regex conservador
        return processWithRegex(filepath, content, rules, profile, audit, gitStage);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESADOR STRING-REGEX
// Para lenguajes sin AST disponible (PHP, Python, Ruby, C#, Java, Kotlin...).
// Usa regex para aislar el interior de strings segun la sintaxis del lenguaje
// y aplica las reglas solo en esos fragmentos.
// ─────────────────────────────────────────────────────────────────────────────

// Patterns por categoria de lenguaje para extraer el interior de strings
const STRING_PATTERNS: Partial<Record<string, RegExp>> = {
    PHP:     /(?<=")((?:[^"\\]|\\.)*?)(?=")|(?<=')((?:[^'\\]|\\.)*?)(?=')/g,
    PYTHON:  /"""([sS]*?)"""|'''([sS]*?)'''|"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g,
    RUBY:    /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g,
    CSHARP:  /@"((?:[^"]|"")*)"|"((?:[^"\\]|\\.)*)"/g,
    JAVA:    /"((?:[^"\\]|\\.)*)"/g,
    KOTLIN:  /"""([sS]*?)"""|"((?:[^"\\]|\\.)*)"/g,
    DART:    /"""([sS]*?)"""|'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g,
    MARKUP:  /(?<=[a-zA-Z-]\s*=\s*)"([^"]*)"/g,
    DATA_XML:/(?<=[a-zA-Z-]\s*=\s*)"([^"]*)"/g,
    VUE_SVELTE: /(?<=")((?:[^"\\]|\\.)*?)(?=")|(?<=')((?:[^'\\]|\\.)*?)(?=')/g,
};

async function processWithStringRegex(
    filepath: string,
    content: string,
    rules: Record<string, boolean>,
    profile: LanguageProfile,
    audit: boolean,
    gitStage: boolean
): Promise<FileSanitizeResult> {
    let modified = content;
    let corruptions = 0;

    const pat = STRING_PATTERNS[profile.category];

    if (pat && rules.smartQuotes) {
        // Reemplazar solo dentro de strings reconocidos por el pattern
        modified = modified.replace(pat, (match: string) => {
            const { fixed, count } = applyEntropyRules(match, rules, profile, true);
            corruptions += count;
            return fixed;
        });
    }

    // Resto de reglas (mojibake, zeroWidth, CRLF) son byte-level y siempre seguros
    if (rules.mojibake && profile.allowMojibake) {
        for (const [bad, good] of Object.entries(REPLACEMENTS)) {
            const c = modified.split(bad).length - 1;
            if (c > 0) { modified = modified.replaceAll(bad, good); corruptions += c; }
        }
    }

    // BOM estandar y fantasma
    if (modified.charCodeAt(0) === 0xFEFF) { modified = modified.slice(1); corruptions++; }
    const ghostBom = (modified.match(/\u00EF\u00BB\u00BF/g) || []).length;
    if (ghostBom > 0) { modified = modified.replace(/\u00EF\u00BB\u00BF/g, ''); corruptions += ghostBom; }

    if (rules.zeroWidth && profile.allowZeroWidth) {
        const inv = /[\u200B\u200C\u200D\u202A-\u202E\u2066-\u2069]/g;
        const c = (modified.match(inv) || []).length;
        if (c > 0) { modified = modified.replace(inv, ''); corruptions += c; }
        if (profile.allowNBSP) {
            const nb = (modified.match(/\u00A0/g) || []).length;
            if (nb > 0) { modified = modified.replace(/\u00A0/g, ' '); corruptions += nb; }
        }
    }

    if (rules.crlf && profile.allowCRLF) {
        const c = (modified.match(/\r\n/g) || []).length;
        if (c > 0) { modified = modified.replace(/\r\n/g, '\n'); corruptions += c; }
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
// PROCESADOR GLOBAL (Regex sin restricciones)
// Para archivos planos: Markdown, YAML, TOML, CSS, ENV.
// No hay sintaxis de lenguaje que pueda romperse.
// ─────────────────────────────────────────────────────────────────────────────
async function processWithRegex(
    filepath: string,
    content: string,
    rules: Record<string, boolean>,
    profile: LanguageProfile,
    audit: boolean,
    gitStage: boolean
): Promise<FileSanitizeResult> {
    let modified = content;
    let corruptions = 0;

    if (rules.mojibake && profile.allowMojibake) {
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

    if (modified.charCodeAt(0) === 0xFEFF) { modified = modified.slice(1); corruptions++; }
    const ghostBom = (modified.match(/\u00EF\u00BB\u00BF/g) || []).length;
    if (ghostBom > 0) { modified = modified.replace(/\u00EF\u00BB\u00BF/g, ''); corruptions += ghostBom; }

    if (rules.smartQuotes && profile.smartQuoteMode === 'global') {
        const { fixed, count } = applyEntropyRules(modified, rules, profile, true);
        if (count > 0) { modified = fixed; corruptions += count; }
    }

    if (rules.zeroWidth && profile.allowZeroWidth) {
        const inv = /[\u200B\u200C\u200D\u202A-\u202E\u2066-\u2069]/g;
        const c = (modified.match(inv) || []).length;
        if (c > 0) { modified = modified.replace(inv, ''); corruptions += c; }
        if (profile.allowNBSP) {
            const nb = (modified.match(/\u00A0/g) || []).length;
            if (nb > 0) { modified = modified.replace(/\u00A0/g, ' '); corruptions += nb; }
        }
    }

    if (rules.crlf && profile.allowCRLF) {
        const c = (modified.match(/\r\n/g) || []).length;
        if (c > 0) { modified = modified.replace(/\r\n/g, '\n'); corruptions += c; }
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
// Clasifica el archivo con LanguageProfiler y enruta al procesador correcto.
// ─────────────────────────────────────────────────────────────────────────────
export async function processFile(filepath: string, options: SanitizeOptions): Promise<FileSanitizeResult> {
    if (isBinaryOrIgnored(filepath)) {
        return { filepath, corruptions: 0, modified: false };
    }

    try {
        const content = await fsP.readFile(filepath, 'utf8');
        const rules   = options.config.rules;
        const profile = detectProfile(filepath, content);
        const audit   = options.audit;
        const git     = options.gitStage ?? false;

        // Archivos minificados: solo operaciones byte-level (mojibake + zeroWidth)
        // Las reglas semanticas (smartQuotes, eradicator) quedan bloqueadas por el perfil.
        if (profile.useAST) {
            return processWithAST(filepath, content, rules, profile, audit, git);
        } else if (profile.smartQuoteMode === 'string-regex') {
            return processWithStringRegex(filepath, content, rules, profile, audit, git);
        } else {
            return processWithRegex(filepath, content, rules, profile, audit, git);
        }

    } catch (_) {
        return { filepath, corruptions: 0, modified: false };
    }
}
