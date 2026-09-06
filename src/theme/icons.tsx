/**
 * Chrome icon registry. Named slugs only. Tint with a token color.
 * Interactive controls (close, chevron) stay Lucide.
 */

export type ChromeIconSlug = "artifacts";

const PATHS: Record<
  ChromeIconSlug,
  { d: string; extra?: string }
> = {
  artifacts: {
    d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    extra: "M14 2v6h6",
  },
};

export function ChromeIcon({
  slug,
  color,
  size = 22,
  title,
}: {
  slug: ChromeIconSlug;
  color: string;
  size?: number;
  title?: string;
}) {
  const path = PATHS[slug];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d={path.d} />
      {path.extra ? <path d={path.extra} /> : null}
    </svg>
  );
}
