import type { ElementType, ReactNode } from 'react';

type Accent = 'orange' | 'lime' | 'paper' | undefined;

/**
 * Display headings are set as fixed lines, exactly as the design frame stacks
 * them. Sizing is container-relative (`cqw`) against the column the heading
 * actually sits in, so a line never re-wraps when the column narrows between
 * breakpoints — the type scales with the column instead.
 */
export function DisplayHeading({
  as: Tag = 'h2',
  id,
  lines,
  accents = [],
  fit,
  className = '',
}: {
  as?: ElementType;
  id?: string;
  lines: readonly string[];
  accents?: readonly Accent[];
  fit: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`fit ${fit}`}>
      <Tag id={id} className={`display ${className}`.trim()}>
        {lines.map((line, index) => {
          const accent = accents[index];
          return (
            <span key={`${index}-${line}`} className={accent ? `accent-${accent}` : undefined}>
              {line}
            </span>
          );
        })}
      </Tag>
    </div>
  );
}
