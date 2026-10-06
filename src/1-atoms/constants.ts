// Expresión regular para cazar corrupción de emojis
export const EMOJI_PATTERN = /ðŸ[^\s"'<>`\n\r]+/g;

export function reverseEmojiMojibake(corrupted: string): string {
    try {
        const buf = Buffer.from(corrupted, 'latin1');
        const decoded = buf.toString('utf8');
        if (decoded.includes('�')) return corrupted;
        return decoded;
    } catch {
        return corrupted;
    }
}
