import { requireAdmin } from "@/lib/dal";

// Programas, biblioteca, trilhas, glossário, Club e configurações: só a admin.
export default async function GestaoLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}
