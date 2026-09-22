import { requireAssessmentAdminPage } from "@/lib/assessment/services/session";
import { AdminShell } from "@/components/admin/admin-shell";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAssessmentAdminPage();

  return (
    <AdminShell email={user.email ?? "-"}>
      {children}
      <Toaster />
    </AdminShell>
  );
}
