"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/misc";
import { NAV_ITEMS } from "@/components/app/nav";
import { useAuthStore } from "@/features/auth/store";
import { useLogout } from "@/features/auth/hooks";
import { useMyBusiness } from "@/features/business/hooks";
import { initials } from "@/lib/format";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary-50 text-primary-700"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
            )}
          >
            <Icon className={cn("size-4.5", active ? "text-primary-600" : "text-zinc-400")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const business = useMyBusiness();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      {business.data && (
        <div className="mx-3 mb-3 flex items-center gap-2.5 rounded-xl bg-zinc-50 px-3 py-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-primary text-xs font-bold text-white">
            {initials(business.data.name)}
          </span>
          <span className="truncate text-sm font-medium text-zinc-800">{business.data.name}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3">
        <NavLinks onNavigate={onNavigate} />
      </div>

      <div className="border-t border-zinc-100 p-3">
        <div className="flex items-center gap-1.5 px-1 py-1.5">
          <Link
            href="/profile"
            onClick={onNavigate}
            className="-mx-1 flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-1 transition-colors hover:bg-zinc-100"
          >
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" className="size-8 rounded-full object-cover" />
            ) : (
              <span className="grid size-8 place-items-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                {initials(user?.firstName || user?.email)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-800">
                {user?.firstName || "Account"}
              </p>
              <p className="truncate text-xs text-zinc-400">{user?.email}</p>
            </div>
          </Link>
          <button
            onClick={() => logout.mutate()}
            aria-label="Sign out"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-zinc-50 lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-zinc-200 bg-white lg:block">
        <SidebarBody />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
        >
          <Menu className="size-5" />
        </button>
        <Logo />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-zinc-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 rounded-lg p-2 text-zinc-400 hover:bg-zinc-100"
            >
              <X className="size-5" />
            </button>
            <SidebarBody onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
