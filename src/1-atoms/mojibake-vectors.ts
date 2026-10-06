export type MojibakeVector = 'LATIN1' | 'CP1252_PUNCTUATION' | 'HTML_ENTITIES' | 'DOUBLE_UTF8';

export const VECTORS: Record<MojibakeVector, Record<string, string>> = {
    LATIN1: {},
    CP1252_PUNCTUATION: {},
    HTML_ENTITIES: {},
    DOUBLE_UTF8: {}
};

const chars = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'Á', 'É', 'Í', 'Ó', 'Ú', 'Ñ', 'ü', 'Ü', '¿', '¡'];

// Generación Dinámica con Inmunidad Matemática
for (const char of chars) {
    const mojibake = Buffer.from(char, 'utf8').toString('latin1');
    VECTORS.LATIN1[mojibake] = char;
    
    const double = Buffer.from(mojibake, 'utf8').toString('latin1');
    VECTORS.DOUBLE_UTF8[double] = char;
}

// Sobreescrituras Críticas LATIN1 (Fallo de terminal Windows)
VECTORS.LATIN1['Ã A'] = 'ÍA';
VECTORS.LATIN1['Ã'] = 'Í';
VECTORS.LATIN1['Ãœ'] = 'Ü';

// Vector: Entidades HTML (Frecuente en exportaciones SQL -> PHP)
VECTORS.HTML_ENTITIES = {
    '&Atilde;&iexcl;': 'á',
    '&Atilde;&copy;': 'é',
    '&Atilde;&shy;': 'í',
    '&Atilde;&sup3;': 'ó',
    '&Atilde;&ordm;': 'ú',
    '&Atilde;&plusmn;': 'ñ',
    '&Atilde;&nbsp;': 'Á',
    '&Atilde;&permil;': 'É',
    '&Atilde;&bdquo;': 'Í',
    '&Atilde;&ldquo;': 'Ó',
    '&Atilde;&scaron;': 'Ú',
    '&Atilde;&lsquo;': 'Ñ',
    '&Atilde;&frac14;': 'ü',
    '&Atilde;&oelig;': 'Ü',
    '&Acirc;&iquest;': '¿',
    '&Acirc;&iexcl;': '¡',
};

// Vector: Puntuación Capa 7 (Windows Clipboard)
VECTORS.CP1252_PUNCTUATION = {
    'â€œ': '“',   // Double left quote
    'â€': '”',   // Double right quote
    'â€‘': '‘',   // Single left quote
    'â€’': '’',   // Single right quote
    'â€—': '—',   // Em dash
    'â€“': '–',   // En dash
    'â€¢': '•',   // Bullet
    'â€¦': '…',   // Ellipsis
};
