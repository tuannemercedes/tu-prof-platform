import { requireAdmin } from "@/lib/dal";

export default async function ConteudosLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}
