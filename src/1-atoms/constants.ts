export const REPLACEMENTS: Record<string, string> = {};

// Inmunización Matemática: Calculamos la mutación base en tiempo de ejecución.
// Hemos agregado puntuación española y diéresis.
const chars = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'Á', 'É', 'Í', 'Ó', 'Ú', 'Ñ', 'ü', 'Ü', '¿', '¡'];
for (const char of chars) {
    const mojibake = Buffer.from(char, 'utf8').toString('latin1');
    REPLACEMENTS[mojibake] = char;
}

// Escudos Anti-Mutilación y Anomalías de Capa 7 (CP1252 / Windows Clipboard)
// Todo mapeado con escapes puros para evadir el motor de Smart Quotes interno.
REPLACEMENTS['\u00C3 A'] = '\u00CD\u0041';       // Fallo de terminal Windows para ÍA
REPLACEMENTS['\u00C3\x8D'] = '\u00CD';           // Fallo latin1 para Í
REPLACEMENTS['\u00C3\u0153'] = '\u00DC';         // CP1252 visual para Ü
REPLACEMENTS['\u00E2\u20AC\u0153'] = '\u201C';   // Comilla doble izquierda
REPLACEMENTS['\u00E2\u20AC\u009D'] = '\u201D';   // Comilla doble derecha
REPLACEMENTS['\u00E2\u20AC\u2018'] = '\u2018';   // Comilla simple izquierda
REPLACEMENTS['\u00E2\u20AC\u2019'] = '\u2019';   // Comilla simple derecha
REPLACEMENTS['\u00E2\u20AC\u2014'] = '\u2014';   // Em dash / Raya
REPLACEMENTS['\u00E2\u20AC\u201C'] = '\u2013';   // En dash / Guion
REPLACEMENTS['\u00E2\u20AC\u00A2'] = '\u2022';   // Bullet
REPLACEMENTS['\u00E2\u20AC\u00A6'] = '\u2026';   // Puntos suspensivos

// Expresión regular para cazar cualquier secuencia que empiece con la corrupción de emojis
export const EMOJI_PATTERN = /\u00F0\u0178[^\s"'<>`\n\r]+/g;

export function reverseEmojiMojibake(corrupted: string): string {
    try {
        const buf = Buffer.from(corrupted, 'latin1');
        const decoded = buf.toString('utf8');
        if (decoded.includes('\uFFFD')) return corrupted;
        return decoded;
    } catch {
        return corrupted;
    }
}
