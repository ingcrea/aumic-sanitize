export interface AumicConfig {
    gitMode: 'auto' | 'block' | 'off';
    rules: {
        mojibake: boolean;
        emojis: boolean;
        crlf: boolean;
        smartQuotes: boolean;
        zeroWidth: boolean;
        eradicator: boolean;
    };
}

export interface SanitizeOptions {
    audit: boolean;
    gitStage: boolean;
    concurrency: number;
    config: AumicConfig;
    fromHook?: boolean;
}

export interface FileSanitizeResult {
    filepath: string;
    corruptions: number;
    modified: boolean;
    originalContent?: string;
}
