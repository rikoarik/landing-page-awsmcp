/** Small inline arrows: the display/mono subsets ship without U+2192/U+2197. */
export function ArrowRight({ className = 'arw' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M1.5 8h12M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  );
}

export function ArrowUpRight({ className = 'arw' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  );
}

/**
 * Renders copy that contains an arrow character without relying on the
 * font's glyph coverage: the arrow becomes an SVG, the words stay text.
 */
export function ArrowText({ text, className = '' }: { text: string; className?: string }) {
  const parts = text.split(/(→|↗)/);
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part === '→') return <ArrowRight key={index} />;
        if (part === '↗') return <ArrowUpRight key={index} />;
        return part ? <span key={index}>{part}</span> : null;
      })}
    </span>
  );
}
