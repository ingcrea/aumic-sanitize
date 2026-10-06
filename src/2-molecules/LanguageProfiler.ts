import type { MojibakeVector } from '../1-atoms/mojibake-vectors';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIAS DE LENGUAJE
// Universo completo: web, desktop, mobile, config, scripting.
// ─────────────────────────────────────────────────────────────────────────────
export type LanguageCategory =
    | 'JS_AST'       // .js .jsx .mjs .cjs — Babel AST disponible
    | 'TS_AST'       // .ts .tsx .astro     — Babel AST + plugin TypeScript
    | 'VUE_SVELTE'   // .vue .svelte        — bloque <script> + template
    | 'PHP'          // .php .phtml         — strings mezclados con HTML
    | 'PYTHON'       // .py .pyw            — comillas simples/dobles y triples
    | 'RUBY'         // .rb .rake           — strings con interpolacion
    | 'GO'           // .go                 — backticks como raw strings
    | 'RUST'         // .rs                 — strings con lifetimes
    | 'CSHARP'       // .cs                 — verbatim strings @"..."
    | 'JAVA'         // .java               — strings estandar
    | 'KOTLIN'       // .kt .kts            — triple-quoted strings
    | 'SWIFT'        // .swift              — string interpolation
    | 'DART'         // .dart               — Flutter / server-side
    | 'CPP'          // .cpp .cc .c .h .hpp — raw strings R"(...)"
    | 'MARKUP'       // .html .htm .xml .svg .xhtml
    | 'STYLE'        // .css .scss .sass .less .styl
    | 'DATA_JSON'    // .json .jsonc        — comillas dobles OBLIGATORIAS
    | 'DATA_YAML'    // .yaml .yml
    | 'DATA_TOML'    // .toml
    | 'DATA_XML'     // .xml .plist .xib
    | 'SHELL'        // .sh .bash .zsh .fish .ps1 .bat .cmd
    | 'SQL'          // .sql
    | 'ENV'          // .env .env.*
    | 'PLAIN'        // .md .mdx .txt .csv .log .rst
    | 'UNKNOWN';

// ─────────────────────────────────────────────────────────────────────────────
// MODOS DE SANITIZACION DE SMART QUOTES
//
// ast-only      → solo dentro de StringLiteral/TemplateLiteral/Comment (Babel)
// string-regex  → regex que identifica delimitadores del lenguaje y opera solo
//                 en el interior (para lenguajes sin AST disponible)
// global        → reemplazo global sin restricciones (archivos planos seguros)
// disabled      → NUNCA tocar comillas (ej: JSON donde ' es invalido)
// ─────────────────────────────────────────────────────────────────────────────
export type SmartQuoteMode = 'ast-only' | 'string-regex' | 'global' | 'disabled';

export interface LanguageProfile {
    category:         LanguageCategory;
    isMinified:       boolean;
    useAST:           boolean;         // Activar pipeline Babel
    smartQuoteMode:   SmartQuoteMode;
    allowEradicator:  boolean;         // Borrar console.log / debugger / TODO
    allowMojibake:    boolean;         // Siempre true excepto en binarios
    allowZeroWidth:   boolean;         // Trojan Source + invisibles
    allowCRLF:        boolean;         // Normalizar saltos de linea
    allowNBSP:        boolean;         // Reemplazar &nbsp; por espacio normal
}

// ─────────────────────────────────────────────────────────────────────────────
// MAPA DE EXTENSION → CATEGORIA
// ─────────────────────────────────────────────────────────────────────────────
const EXT_MAP: Record<string, LanguageCategory> = {
    // JavaScript ecosystem
    '.js':    'JS_AST',
    '.jsx':   'JS_AST',
    '.mjs':   'JS_AST',
    '.cjs':   'JS_AST',
    '.es':    'JS_AST',
    // TypeScript / meta-frameworks
    '.ts':    'TS_AST',
    '.tsx':   'TS_AST',
    '.astro': 'TS_AST',
    // Component frameworks
    '.vue':   'VUE_SVELTE',
    '.svelte':'VUE_SVELTE',
    // Backend web
    '.php':   'PHP',
    '.phtml': 'PHP',
    // Python
    '.py':    'PYTHON',
    '.pyw':   'PYTHON',
    '.pyi':   'PYTHON',
    // Ruby
    '.rb':    'RUBY',
    '.rake':  'RUBY',
    '.gemspec':'RUBY',
    '.erb':   'RUBY',
    // Go
    '.go':    'GO',
    // Rust
    '.rs':    'RUST',
    // C# / .NET
    '.cs':    'CSHARP',
    '.csx':   'CSHARP',
    // Java
    '.java':  'JAVA',
    '.groovy':'JAVA',
    // Kotlin (Android / Server)
    '.kt':    'KOTLIN',
    '.kts':   'KOTLIN',
    // Swift (iOS / macOS)
    '.swift': 'SWIFT',
    // Dart (Flutter)
    '.dart':  'DART',
    // C / C++
    '.c':     'CPP',
    '.h':     'CPP',
    '.cpp':   'CPP',
    '.cc':    'CPP',
    '.cxx':   'CPP',
    '.hpp':   'CPP',
    '.hxx':   'CPP',
    // Markup
    '.html':  'MARKUP',
    '.htm':   'MARKUP',
    '.xml':   'DATA_XML',
    '.svg':   'MARKUP',
    '.xhtml': 'MARKUP',
    '.plist': 'DATA_XML',
    '.xib':   'DATA_XML',
    // Styles
    '.css':   'STYLE',
    '.scss':  'STYLE',
    '.sass':  'STYLE',
    '.less':  'STYLE',
    '.styl':  'STYLE',
    // Data
    '.json':  'DATA_JSON',
    '.jsonc': 'DATA_JSON',
    '.yaml':  'DATA_YAML',
    '.yml':   'DATA_YAML',
    '.toml':  'DATA_TOML',
    // Shell / scripting
    '.sh':    'SHELL',
    '.bash':  'SHELL',
    '.zsh':   'SHELL',
    '.fish':  'SHELL',
    '.ps1':   'SHELL',
    '.bat':   'SHELL',
    '.cmd':   'SHELL',
    // SQL
    '.sql':   'SQL',
    // Plain text
    '.md':    'PLAIN',
    '.mdx':   'PLAIN',
    '.txt':   'PLAIN',
    '.csv':   'PLAIN',
    '.log':   'PLAIN',
    '.rst':   'PLAIN',
};

// ─────────────────────────────────────────────────────────────────────────────
// PERFILES POR CATEGORIA
// Define las capacidades de sanitizacion para cada tipo de lenguaje.
// ─────────────────────────────────────────────────────────────────────────────
function buildProfile(cat: LanguageCategory, isMinified: boolean): LanguageProfile {
    // Perfil base: conservador y seguro
    const base: LanguageProfile = {
        category:        cat,
        isMinified,
        useAST:          false,
        smartQuoteMode:  'disabled',
        allowEradicator: false,
        allowMojibake:   true,
        allowZeroWidth:  true,
        allowCRLF:       true,
        allowNBSP:       true,
        allowedMojibakeVectors: ['LATIN1', 'CP1252_PUNCTUATION', 'DOUBLE_UTF8'],
    };

    switch (cat) {
        case 'JS_AST':
        case 'TS_AST':
            return { ...base,
                useAST:          !isMinified,   // Sin AST en minificados: muy costoso y sin valor
                smartQuoteMode:  isMinified ? 'disabled' : 'ast-only',
                allowEradicator: !isMinified,   // Nunca borrar console.log en .min.js
            };

        case 'VUE_SVELTE':
            // Bloque <script> se trata como TS_AST, el template como MARKUP.
            // Por ahora usamos string-regex hasta integrar un parser Vue.
            return { ...base,
                smartQuoteMode: isMinified ? 'disabled' : 'string-regex',
                allowEradicator: false,
            };

        case 'PHP':
            return { ...base,
                smartQuoteMode:  'string-regex',
                allowEradicator: false,
                allowNBSP:       false,
                allowedMojibakeVectors: ['LATIN1', 'CP1252_PUNCTUATION', 'DOUBLE_UTF8', 'HTML_ENTITIES'],
            };

        case 'PYTHON':
            // Python usa ' " y triple-quotes. string-regex cubre los casos estandar.
            return { ...base,
                smartQuoteMode:  'string-regex',
                allowEradicator: false,  // print() puede ser logging legitimo en Python
            };

        case 'RUBY':
            return { ...base,
                smartQuoteMode:  'string-regex',
                allowEradicator: false,
            };

        case 'GO':
            // Go usa backticks para raw strings. Los strings normales usan ".
            // Las comillas simples son rune literals — NUNCA tocar.
            return { ...base,
                smartQuoteMode:  'disabled',  // Demasiado riesgo con rune literals
                allowEradicator: false,
            };

        case 'RUST':
            return { ...base,
                smartQuoteMode:  'disabled',  // char literals son ' — no tocar
                allowEradicator: false,
            };

        case 'CSHARP':
            // C# tiene verbatim strings @"..." y string interpolation $"..."
            return { ...base,
                smartQuoteMode:  'string-regex',
                allowEradicator: false,
            };

        case 'JAVA':
        case 'KOTLIN':
            return { ...base,
                smartQuoteMode:  'string-regex',
                allowEradicator: false,
            };

        case 'SWIFT':
            // Swift tiene interpolacion avanzada y raw strings #"..."#
            return { ...base,
                smartQuoteMode:  'disabled',
                allowEradicator: false,
            };

        case 'DART':
            return { ...base,
                smartQuoteMode:  'string-regex',
                allowEradicator: false,
            };

        case 'CPP':
            // C/C++ tiene char literals (') y raw strings R"(...)". Demasiado riesgo.
            return { ...base,
                smartQuoteMode:  'disabled',
                allowEradicator: false,
            };

        case 'MARKUP':
            return { ...base,
                smartQuoteMode:  'string-regex',
                allowEradicator: false,
                allowCRLF:       false,
                allowedMojibakeVectors: ['LATIN1', 'CP1252_PUNCTUATION', 'DOUBLE_UTF8', 'HTML_ENTITIES'],
            };

        case 'STYLE':
            // CSS/SCSS: strings solo en url() y content. Global es seguro.
            return { ...base,
                smartQuoteMode:  isMinified ? 'disabled' : 'global',
                allowEradicator: false,
            };

        case 'DATA_JSON':
            // JSON ESTRICTO: las comillas simples son INVALIDAS. NUNCA reemplazar.
            return { ...base,
                smartQuoteMode:  'disabled',  // No existe ' valido en JSON
                allowEradicator: false,
                allowNBSP:       false,
            };

        case 'DATA_YAML':
        case 'DATA_TOML':
            return { ...base,
                smartQuoteMode:  'global',  // Strings son de texto — global seguro
                allowEradicator: false,
            };

        case 'DATA_XML':
            return { ...base,
                smartQuoteMode:  'string-regex',
                allowEradicator: false,
                allowNBSP:       false,
            };

        case 'SHELL':
            // Scripts shell: ' y " tienen semantica diferente (expansión vs literal)
            return { ...base,
                smartQuoteMode:  'disabled',
                allowEradicator: false,
            };

        case 'SQL':
            // SQL usa ' para strings. Las comillas dobles son identificadores.
            return { ...base,
                smartQuoteMode:  'disabled',  // Cambiar ' a ' en SQL rompe la sintaxis
                allowEradicator: false,
            };

        case 'ENV':
            return { ...base,
                smartQuoteMode:  'global',
                allowEradicator: false,
                allowCRLF:       true,
            };

        case 'PLAIN':
        default:
            return { ...base,
                smartQuoteMode:  'global',
                allowEradicator: false,
            };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DETECTOR DE MINIFICACION
// Un archivo esta minificado si cumple al menos 2 de estas condiciones.
// ─────────────────────────────────────────────────────────────────────────────
function detectMinification(filepath: string, content: string): boolean {
    let signals = 0;

    // 1. El nombre del archivo contiene .min.
    if (path.basename(filepath).includes('.min.')) signals++;

    // 2. El archivo es practicamente una sola linea larga
    const lines = content.split('\n');
    if (lines.length <= 3 && content.length > 500) signals++;

    // 3. La linea mas larga supera 500 caracteres (threshold heuristico)
    const maxLineLen = Math.max(...lines.map((l: string) => l.length));
    if (maxLineLen > 500) signals++;

    // 4. Ratio de saltos de linea muy bajo (densidad de codigo alta)
    const nlRatio = (content.match(/\n/g) || []).length / content.length;
    if (nlRatio < 0.002 && content.length > 1000) signals++;

    return signals >= 2;
}

// ─────────────────────────────────────────────────────────────────────────────
// API PUBLICA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detecta el perfil de lenguaje de un archivo.
 * Combina extension, nombre de archivo y analisis heuristico del contenido.
 */
export function detectProfile(filepath: string, content: string): LanguageProfile {
    const ext = path.extname(filepath).toLowerCase();
    const basename = path.basename(filepath).toLowerCase();

    // Deteccion especial por nombre de archivo (sin extension)
    let category: LanguageCategory = EXT_MAP[ext] ?? 'UNKNOWN';
    if (category === 'UNKNOWN') {
        if (basename === '.env' || basename.startsWith('.env.')) category = 'ENV';
        else if (basename === 'makefile' || basename === 'dockerfile') category = 'SHELL';
        else if (basename === 'gemfile' || basename === 'rakefile') category = 'RUBY';
        else if (basename === 'podfile' || basename === 'fastfile') category = 'RUBY';
        else if (basename.endsWith('.gradle')) category = 'KOTLIN';
    }

    const isMinified = detectMinification(filepath, content);

    return buildProfile(category, isMinified);
}

// ─────────────────────────────────────────────────────────────────────────────
// LISTA NEGRA DE BINARIOS Y DOCUMENTOS COMPILADOS
// El motor ignorará estos archivos instantáneamente antes de la lectura en disco.
// ─────────────────────────────────────────────────────────────────────────────
const BINARY_EXTENSIONS = new Set([
    // Documentos compilados
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    // Imágenes (Nota: .svg se ignora aquí porque ES texto y ya está en MARKUP)
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.ico', '.tiff',
    // Fuentes
    '.ttf', '.woff', '.woff2', '.eot', '.otf',
    // Comprimidos
    '.zip', '.tar', '.gz', '.7z', '.rar',
    // Binarios y ejecutables
    '.exe', '.dll', '.so', '.dylib', '.bin', '.dat',
    // Audio / Video
    '.mp3', '.mp4', '.avi', '.mov', '.mkv', '.wav'
]);

export function isBinaryOrIgnored(filepath: string): boolean {
    const ext = path.extname(filepath).toLowerCase();
    return BINARY_EXTENSIONS.has(ext);
}
