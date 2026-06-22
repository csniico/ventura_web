import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/ui/misc";

const HIGHLIGHTS = [
  "Track customers, orders and invoices in one place",
  "Send branded invoices and record payments",
  "See revenue and inventory at a glance",
];

/**
 * Two-column auth layout: a photographic brand panel (desktop) beside the form.
 * On small screens the panel is hidden and a compact logo header is shown.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel — image + overlay */}
      <aside className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <Image src="/landing/auth.jpg" alt="" fill priority sizes="50vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-950/85 via-primary-900/80 to-primary-950/90" />

        <Link href="/">
          <span className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-white/15 backdrop-blur">V</span>
            Ventura
          </span>
        </Link>
        <div className="space-y-6">
          <h2 className="max-w-sm text-3xl font-semibold leading-tight">
            Run your business with clarity.
          </h2>
          <ul className="space-y-3">
            {HIGHLIGHTS.map((line) => (
              <li key={line} className="flex items-start gap-3 text-sm text-white/90">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-white/70" />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/60">© {new Date().getFullYear()} Ventura</p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col justify-center px-5 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
            {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
          </div>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-zinc-500">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
