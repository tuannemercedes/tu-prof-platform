import { requireAdmin } from "@/lib/dal";

export default async function PreviewLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}
