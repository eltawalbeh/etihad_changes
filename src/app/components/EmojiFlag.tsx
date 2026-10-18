/**
 * EmojiFlag — renders a flag emoji using a dedicated emoji font stack
 * that overrides IBM Plex Sans Arabic (which has no emoji glyphs).
 *
 * Accepts EITHER:
 *   - An actual emoji string (🇸🇦, 🇦🇪 …) — passed through as-is
 *   - A 2-letter ISO 3166-1 alpha-2 code ("SA", "AE", "MA" …)
 *   - Common abbreviations ("UAE", "KSA", "UK", "USA") — auto-mapped
 *
 * This handles both the mock data (which stores real emojis) and the
 * Supabase database (which may store plain text codes like "SA", "UAE").
 */

// System emoji font stack — covers macOS/iOS, Android/Linux, and Windows
const EMOJI_FONT =
  "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', emoji";

/** Non-standard abbreviation → ISO 3166-1 alpha-2 */
const ALIASES: Record<string, string> = {
  UAE: 'AE',
  KSA: 'SA',
  UK:  'GB',
  USA: 'US',
  EUR: 'EU',
};

/**
 * Converts a country code or abbreviation to a flag emoji.
 * If the input already contains non-ASCII characters (i.e. it IS an emoji),
 * it is returned unchanged.
 */
export function toFlagEmoji(value: string): string {
  if (!value) return '';

  // Already contains non-ASCII / surrogate pairs → it's a real emoji, keep it
  if ([...value].some((ch) => ch.codePointAt(0)! > 127)) {
    return value;
  }

  const upper = value.trim().toUpperCase();

  // Map known aliases first
  const iso = ALIASES[upper] ?? upper;

  // Must be exactly 2 letters now
  if (!/^[A-Z]{2}$/.test(iso)) return value;

  // Regional Indicator offset: U+1F1E6 = 'A'
  const OFFSET = 0x1f1e6 - 0x41; // 0x1F1A6 - 65
  return String.fromCodePoint(
    iso.codePointAt(0)! + OFFSET,
    iso.codePointAt(1)! + OFFSET
  );
}

interface EmojiFlagProps {
  /** Country code ("SA", "UAE", "🇸🇦") or emoji string — all are handled */
  emoji: string;
  className?: string;
}

export function EmojiFlag({ emoji, className = '' }: EmojiFlagProps) {
  return (
    <span
      style={{ fontFamily: EMOJI_FONT }}
      className={className}
      aria-hidden="true"
    >
      {toFlagEmoji(emoji)}
    </span>
  );
}
