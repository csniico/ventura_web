import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function PrimaryCta({
  className,
  children = "Get started",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href="/login"
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700",
        className,
      )}
    >
      {children}
      <ArrowRight className="size-4" />
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation + hero                                                   */
/* ------------------------------------------------------------------ */

function Nav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white">
          <span className="grid size-8 place-items-center rounded-lg bg-white/15 text-sm font-bold backdrop-blur">
            V
          </span>
          <span className="text-lg font-semibold tracking-tight">Ventura</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-white/80 md:flex">
          <a href="#features" className="transition-colors hover:text-white">
            Features
          </a>
          <a href="#how" className="transition-colors hover:text-white">
            How it works
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden h-10 items-center rounded-lg px-4 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 items-center rounded-lg bg-white px-4 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-white/90"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <Image src="/landing/hero.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-950/90 via-primary-900/80 to-zinc-950/85" />

      <Nav />

      <div className="mx-auto flex max-w-6xl flex-col items-start gap-7 px-5 pb-24 pt-36 sm:px-6 sm:pb-32 sm:pt-48">
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl">
          The quiet operating system for your business.
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
          Customers, orders, invoices and appointments — together in one place, so the
          admin runs itself and you can focus on the work that matters.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <PrimaryCta className="w-full sm:w-auto">Get started — it&apos;s free</PrimaryCta>
          <Link
            href="/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            Sign in
          </Link>
        </div>
        <p className="text-sm text-white/60">No credit card required · Set up in minutes</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Bento feature grid — each tile previews a real part of the product  */
/* ------------------------------------------------------------------ */

function Tile({
  title,
  desc,
  className,
  children,
}: {
  title: string;
  desc: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <div>
        <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-zinc-500">{desc}</p>
      </div>
      <div className="mt-auto">{children}</div>
    </div>
  );
}

const CHART = [38, 52, 44, 61, 50, 72, 66, 84, 78, 96];

function RevenueMock() {
  return (
    <div className="rounded-2xl bg-zinc-50 p-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-400">Revenue · last 30 days</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">GHS 48,200</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
          <TrendingUp className="size-3.5" /> 12.4%
        </span>
      </div>
      <div className="mt-5 flex h-24 items-end gap-1.5">
        {CHART.map((h, i) => (
          <div
            key={i}
            className={cn("flex-1 rounded-t-md", i >= CHART.length - 2 ? "bg-primary-600" : "bg-primary-200")}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function InvoiceMock() {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">INV-2043</span>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          PAID
        </span>
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-zinc-900">GHS 4,250.00</p>
      <p className="mt-1 text-xs text-zinc-500">Ama Mensah · due Jun 30</p>
    </div>
  );
}

const PEOPLE = [
  { name: "Ama Mensah", meta: "12 orders", tone: "bg-rose-100 text-rose-700" },
  { name: "Kofi Boateng", meta: "5 orders", tone: "bg-amber-100 text-amber-700" },
  { name: "Esi Owusu", meta: "9 orders", tone: "bg-sky-100 text-sky-700" },
];

function CustomersMock() {
  return (
    <ul className="space-y-2.5">
      {PEOPLE.map((p) => (
        <li key={p.name} className="flex items-center gap-3">
          <span className={cn("grid size-8 place-items-center rounded-full text-xs font-semibold", p.tone)}>
            {p.name[0]}
          </span>
          <span className="flex-1 text-sm font-medium text-zinc-800">{p.name}</span>
          <span className="text-xs text-zinc-400">{p.meta}</span>
        </li>
      ))}
    </ul>
  );
}

function OrderMock() {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-400">ORD-1182</span>
        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
          <span className="size-1.5 rounded-full bg-emerald-500" /> Completed
        </span>
      </div>
      <div className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between text-zinc-600">
          <span>Studio session ×2</span>
          <span>GHS 600</span>
        </div>
        <div className="flex justify-between text-zinc-600">
          <span>Print pack ×1</span>
          <span>GHS 380</span>
        </div>
      </div>
      <div className="mt-3 flex justify-between border-t border-zinc-200 pt-3 text-sm font-semibold text-zinc-900">
        <span>Total</span>
        <span>GHS 980</span>
      </div>
    </div>
  );
}

const AGENDA = [
  { time: "09:00", title: "Consultation — Ama", accent: "border-primary-500" },
  { time: "13:30", title: "Fitting — Kofi", accent: "border-amber-400" },
];

function CalendarMock() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
        <CalendarDays className="size-3.5" /> Today
      </div>
      {AGENDA.map((a) => (
        <div key={a.time} className={cn("rounded-xl border-l-2 bg-zinc-50 px-3 py-2", a.accent)}>
          <p className="text-xs text-zinc-400">{a.time}</p>
          <p className="text-sm font-medium text-zinc-800">{a.title}</p>
        </div>
      ))}
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="bg-zinc-50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">One workspace</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            See your business the way it actually runs
          </h2>
          <p className="mt-3 text-base text-zinc-500 sm:text-lg">
            Not another folder of features — a connected workspace where a sale becomes an
            order, an order becomes an invoice, and the numbers update themselves.
          </p>
        </div>

        <div className="mt-12 grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Tile
            title="Insights that keep up"
            desc="Revenue, top products and low stock — recalculated as you work, never stale."
            className="sm:col-span-2"
          >
            <RevenueMock />
          </Tile>
          <Tile title="Invoices, sent in seconds" desc="Branded invoices, payments recorded, balances tracked.">
            <InvoiceMock />
          </Tile>
          <Tile title="Customers with context" desc="Every contact, note and order history, a tap away.">
            <CustomersMock />
          </Tile>
          <Tile title="Orders that flow" desc="Bundle products and services, track status to done.">
            <OrderMock />
          </Tile>
          <Tile title="A calendar that books itself" desc="Appointments and recurring bookings, organized.">
            <CalendarMock />
          </Tile>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Steps — editorial two-column layout                                 */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    n: "1",
    title: "Create your business",
    body: "Tell us your name and what you do. You're set up in under a minute — no manuals, no migration.",
  },
  {
    n: "2",
    title: "Bring in customers & products",
    body: "Add the people you serve and the things you sell, or import them in bulk from a spreadsheet.",
  },
  {
    n: "3",
    title: "Sell, invoice and grow",
    body: "Take orders, send invoices, record payments — and watch your dashboard come to life.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Getting started</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            From sign-up to first invoice in an afternoon
          </h2>
          <p className="mt-3 text-base text-zinc-500">
            Ventura guides you the whole way — the next right step is always obvious.
          </p>
          <PrimaryCta className="mt-8 inline-flex">Start free</PrimaryCta>
        </div>

        <ol className="space-y-10">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative flex gap-5 pl-2">
              <div className="flex flex-col items-center">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                  {s.n}
                </span>
                {i < STEPS.length - 1 && <span className="mt-2 w-px flex-1 bg-zinc-200" />}
              </div>
              <div className="pb-2">
                <h3 className="text-lg font-semibold text-zinc-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Closing CTA                                                         */
/* ------------------------------------------------------------------ */

function CtaBand() {
  return (
    <section className="bg-zinc-50 px-5 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-primary-950 ring-1 ring-white/10">
        <div className="flex flex-col items-start gap-8 px-7 py-12 sm:px-12 lg:flex-row lg:items-center lg:justify-between lg:py-16">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Give your business a calmer home.
            </h2>
            <p className="mt-3 text-primary-100/80">
              Create a free Ventura account and send your first invoice today.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-semibold text-primary-700 transition-colors hover:bg-white/90 lg:w-auto"
          >
            Create free account <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-gradient-primary text-xs font-bold text-white">
            V
          </span>
          <span className="font-semibold tracking-tight text-zinc-900">Ventura</span>
        </Link>
        <p className="text-sm text-zinc-400">© {new Date().getFullYear()} Ventura. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <Hero />
      <Features />
      <HowItWorks />
      <CtaBand />
      <Footer />
    </div>
  );
}
