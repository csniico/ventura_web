import { RequireAuth } from "@/features/auth/guard";
import { BusinessGate } from "@/components/app/business-gate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <BusinessGate>{children}</BusinessGate>
    </RequireAuth>
  );
}
