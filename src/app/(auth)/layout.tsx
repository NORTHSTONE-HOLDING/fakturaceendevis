import Link from "next/link";

import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="relative hidden overflow-hidden bg-graphite lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(38,52%,50%,0.25),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,hsl(38,52%,50%,0.18),transparent_45%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-graphite-foreground">
          <Link href="/" className="flex items-center gap-3">
            <Logo showWordmark={false} size={40} />
            <span className="text-lg font-semibold tracking-tight text-white">
              ENDEVIS <span className="text-gradient-gold">InvoiceFlow</span>
            </span>
          </Link>
          <div className="max-w-md space-y-6">
            <h1 className="text-4xl font-semibold leading-tight text-white">
              The premium ERP for modern businesses.
            </h1>
            <p className="text-white/70">
              Invoicing, warehouse, quotations and AI automation — beautifully
              unified in one elegant platform.
            </p>
            <ul className="space-y-2 text-sm text-white/60">
              <li>• Database-controlled document numbering</li>
              <li>• Row Level Security &amp; full audit trail</li>
              <li>• AI assistant with access to your data</li>
            </ul>
          </div>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} ENDEVIS s.r.o. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
