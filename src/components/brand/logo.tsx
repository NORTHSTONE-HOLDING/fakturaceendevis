import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: number;
}

/**
 * ENDEVIS InvoiceFlow brand mark — a gold monogram used across the app and PDFs.
 */
export function Logo({ className, showWordmark = true, size = 36 }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="48" height="48" rx="12" fill="url(#endevis-gold)" />
        <path
          d="M15 14h18v5H21v3.5h10v4.8H21V31h12v5H15V14z"
          fill="#1A1D23"
        />
        <defs>
          <linearGradient
            id="endevis-gold"
            x1="0"
            y1="0"
            x2="48"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#E4C374" />
            <stop offset="1" stopColor="#B8873B" />
          </linearGradient>
        </defs>
      </svg>
      {showWordmark && (
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">
            ENDEVIS
          </div>
          <div className="text-[11px] font-medium text-muted-foreground">
            InvoiceFlow
          </div>
        </div>
      )}
    </div>
  );
}
