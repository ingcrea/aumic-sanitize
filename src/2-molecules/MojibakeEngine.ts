import { VECTORS, type MojibakeVector } from '../1-atoms/mojibake-vectors';

export class MojibakeEngine {
    /**
     * Motor Heurístico de Sanitización de Nivel 7.
     * Evalúa la presencia de firmas de corrupción antes de disparar mutaciones.
     */
    static cure(raw: string, allowedVectors: MojibakeVector[]): { fixed: string; count: number } {
        let fixed = raw;
        let totalCount = 0;

        const scores: Record<MojibakeVector, number> = {
            LATIN1: 0,
            CP1252_PUNCTUATION: 0,
            HTML_ENTITIES: 0,
            DOUBLE_UTF8: 0
        };

        // 1. Barrido Forense (Scoring)
        for (const vector of allowedVectors) {
            const dict = VECTORS[vector];
            for (const bad of Object.keys(dict)) {
                const count = fixed.split(bad).length - 1;
                if (count > 0) scores[vector] += count;
            }
        }

        // 2. Ejecución Jerárquica (Para evitar colisiones entre encodings anidados)
        const hierarchy: MojibakeVector[] = [
            'DOUBLE_UTF8',       // Jerarquía Máxima (Contiene LATIN1 anidado)
            'HTML_ENTITIES',     // Jerarquía Alta (Sintaxis explícita)
            'LATIN1',            // Jerarquía Media (Mapeo directo)
            'CP1252_PUNCTUATION' // Jerarquía Estándar
        ];

        for (const vector of hierarchy) {
            if (allowedVectors.includes(vector) && scores[vector] > 0) {
                const { res, c } = this.applyVector(fixed, vector);
                fixed = res;
                totalCount += c;
            }
        }

        return { fixed, count: totalCount };
    }

    private static applyVector(raw: string, vector: MojibakeVector): { res: string, c: number } {
        let res = raw;
        let c = 0;
        for (const [bad, good] of Object.entries(VECTORS[vector])) {
            const count = res.split(bad).length - 1;
            if (count > 0) {
                res = res.replaceAll(bad, good);
                c += count;
            }
        }
        return { res, c };
    }
}
