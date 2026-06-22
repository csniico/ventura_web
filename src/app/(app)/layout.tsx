import { RequireAuth } from "@/features/auth/guard";
import { AppHeader } from "@/components/app/app-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-dvh flex-col bg-zinc-50">
        <AppHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
      </div>
    </RequireAuth>
  );
}
