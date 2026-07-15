/**
 * components/common/icons.tsx
 * ----------------------------------------------------------------------------
 * A small, hand-drawn set of line icons instead of pulling in an icon
 * library. Every icon uses stroke="currentColor", so it automatically
 * matches whatever text color it's placed in — including across the
 * light/dark theme switch, with zero extra theming logic.
 * ----------------------------------------------------------------------------
 */

export interface IconProps {
  size?: number;
  className?: string;
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function SunIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8l1.8-1.8M18 6l1.8-1.8" />
    </svg>
  );
}

export function MoonIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

export function MonitorIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

export function PlusIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function EyeIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function PencilIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M4 20l4-1 11-11-3-3L5 16l-1 4Z" />
      <path d="M13.5 5.5l3 3" />
    </svg>
  );
}

export function TrashIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7M18 7l-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7" />
    </svg>
  );
}

export function LogOutIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

export function ChevronLeftIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function ImageIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M21 16l-5.5-5.5L5 21" />
    </svg>
  );
}

export function CloseIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function TrendingUpIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M3 17l6-6 4 4 8-8M15 6h6v6" />
    </svg>
  );
}
