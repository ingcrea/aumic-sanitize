import fs from 'fs';
import path from 'path';
import type { AumicConfig } from '../1-atoms/types';

export const DEFAULT_CONFIG: AumicConfig = {
    gitMode: 'block',
    rules: {
        mojibake: true,
        emojis: true,
        crlf: true,
        smartQuotes: true,
        zeroWidth: true,
        eradicator: false
    }
};

export function loadConfig(targetDir: string): AumicConfig {
    const configPath = path.join(targetDir, 'aumic.config.json');
    if (fs.existsSync(configPath)) {
        try {
            const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return {
                gitMode: parsed.gitMode || DEFAULT_CONFIG.gitMode,
                rules: { ...DEFAULT_CONFIG.rules, ...(parsed.rules || {}) }
            };
        } catch {
            return DEFAULT_CONFIG;
        }
    }
    return DEFAULT_CONFIG;
}

export function initConfig(targetDir: string) {
    const configPath = path.join(targetDir, 'aumic.config.json');
    fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 4), 'utf8');
}
