"use client";

import { LogOut } from "lucide-react";
import { Logo } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store";
import { useLogout } from "@/features/auth/hooks";

export function AppHeader() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const initial = (user?.firstName?.[0] ?? user?.email?.[0] ?? "?").toUpperCase();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              {initial}
            </span>
            <span className="hidden text-sm font-medium text-zinc-700 sm:block">
              {user?.firstName || user?.email}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout.mutate()}
            loading={logout.isPending}
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
