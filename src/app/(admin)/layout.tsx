import { RequireAuth } from "@/features/auth/guard";
import { AdminGate } from "@/components/app/admin-gate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AdminGate>{children}</AdminGate>
    </RequireAuth>
  );
}
