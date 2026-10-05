import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';

import { parse } from '@babel/parser';
const traverse = require('@babel/traverse').default || require('@babel/traverse');
import MagicString from 'magic-string';

import { REPLACEMENTS, EMOJI_PATTERN, reverseEmojiMojibake } from '../1-atoms/constants';
import type { SanitizeOptions, FileSanitizeResult } from '../1-atoms/types';

export async function processFile(filepath: string, options: SanitizeOptions): Promise<FileSanitizeResult> {
    try {
        let content = await fs.readFile(filepath, 'utf8');
        const originalContent = content;
        let corruptions = 0;
        const rules = options.config.rules;

        // A. Limpieza de Acentos
        if (rules.mojibake) {
            for (const [bad, good] of Object.entries(REPLACEMENTS)) {
                let count = content.split(bad).length - 1;
                if (count > 0) {
                    content = content.replaceAll(bad, good);
                    corruptions += count;
                }
            }
        }

        // B. Heurística de Emojis
        if (rules.emojis) {
            content = content.replace(EMOJI_PATTERN, (match) => {
                const fixed = reverseEmojiMojibake(match);
                if (fixed !== match) { corruptions++; return fixed; }
                return match;
            });
        }

        // C. Limpieza de BOM (Estándar y Fantasma)
        // El BOM estándar al inicio (\uFEFF)
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
            corruptions++;
        }
        // BOM Fantasma () en medio del código (ej. concatenación de archivos)
        // Se busca por secuencia Hex para evitar automutilación
        const ghostBomCount = (content.match(/\u00EF\u00BB\u00BF/g) || []).length;
        if (ghostBomCount > 0) {
            content = content.replace(/\u00EF\u00BB\u00BF/g, "");
            corruptions += ghostBomCount;
        }

        // D. Comillas Tipográficas (Smart Quotes que rompen JSON y Strings)
        // Usamos \u201C, \u201D, \u2018, \u2019 explícitamente para evitar automutilación
        if (rules.smartQuotes) {
            const doubleQ = (content.match(/[\u201C\u201D]/g) || []).length;
            if (doubleQ > 0) { content = content.replace(/[\u201C\u201D]/g, '"'); corruptions += doubleQ; }
            const singleQ = (content.match(/[\u2018\u2019]/g) || []).length;
            if (singleQ > 0) { content = content.replace(/[\u2018\u2019]/g, "'"); corruptions += singleQ; }
        }

        // E. Exorcismo Zero-Width, NBSP y Trojan Source (BiDi)
        if (rules.zeroWidth) {
            // \u200B-\u200D: Zero Width
            // \u202A-\u202E, \u2066-\u2069: Directional Overrides (ataques Trojan Source)
            const invisibleRegex = /[\u200B\u200C\u200D\u202A-\u202E\u2066-\u2069]/g;
            const zWidth = (content.match(invisibleRegex) || []).length;
            if (zWidth > 0) { 
                content = content.replace(invisibleRegex, ""); 
                corruptions += zWidth; 
            }
            
            // NBSP (\u00A0) se reemplaza por espacio normal, no se elimina
            const nbspCount = (content.match(/\u00A0/g) || []).length;
            if (nbspCount > 0) {
                content = content.replace(/\u00A0/g, " ");
                corruptions += nbspCount;
            }
        }

        // F. Normalización CRLF
        if (rules.crlf) {
            const crlfCount = (content.match(/\r\n/g) || []).length;
            if (crlfCount > 0) { content = content.replace(/\r\n/g, "\n"); corruptions += crlfCount; }
        }

        // G. El Erradicador de Producción (Solo para código)
        if (rules.eradicator) {
            const ext = path.extname(filepath).toLowerCase();
            if (['.js', '.ts', '.jsx', '.tsx', '.astro'].includes(ext)) {
                // Borrar console.log/info/debug vacíos o en línea
                const consoleCount = (content.match(/^[ \t]*console\.(log|info|debug|warn)\(.*?\);?[ \t]*\r?\n?/gm) || []).length;
                if (consoleCount > 0) {
                    content = content.replace(/^[ \t]*console\.(log|info|debug|warn)\(.*?\);?[ \t]*\r?\n?/gm, "");
                    corruptions += consoleCount;
                }
                
                // Borrar debugger;
                const debugCount = (content.match(/^[ \t]*debugger;[ \t]*\r?\n?/gm) || []).length;
                if (debugCount > 0) {
                    content = content.replace(/^[ \t]*debugger;[ \t]*\r?\n?/gm, "");
                    corruptions += debugCount;
                }

                // Borrar TODOs
                const todoCount = (content.match(/^[ \t]*\/\/ ?TODO:.*?\r?\n?/gmi) || []).length;
                if (todoCount > 0) {
                    content = content.replace(/^[ \t]*\/\/ ?TODO:.*?\r?\n?/gmi, "");
                    corruptions += todoCount;
                }
            }
        }

        if (content !== originalContent) {
            if (!options.audit) {
                await fs.writeFile(filepath, content, 'utf8');
                if (options.gitStage) {
                    try { execSync(`git add "${filepath}"`, { cwd: path.dirname(filepath), stdio: 'ignore' }); } catch (e) {}
                }
            }
            return { filepath, corruptions, modified: true, originalContent };
        }
        return { filepath, corruptions: 0, modified: false };
    } catch (error) {
        return { filepath, corruptions: 0, modified: false };
    }
}
