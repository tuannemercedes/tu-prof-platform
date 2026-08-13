import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import SignOutButton from "@/components/sign-out-button";

const NAV_ITEMS = [
  { href: "/admin", label: "Início" },
  { href: "/admin/turmas", label: "Turmas" },
  { href: "/admin/alunos", label: "Alunos" },
  { href: "/admin/materias", label: "Matérias" },
  { href: "/admin/fia", label: "FIA" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAdmin();

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <aside className="sm:w-56 shrink-0 border-b sm:border-b-0 sm:border-r border-gray-200 p-4 flex flex-col gap-4 sm:h-screen sm:sticky sm:top-0 sm:overflow-y-auto">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold">Tu Prof</p>
            <p className="text-xs text-gray-500">Painel do admin</p>
          </div>
          <div className="text-xs text-gray-500 shrink-0">
            <SignOutButton />
          </div>
        </div>
        <p className="text-xs text-gray-500 truncate -mt-2">{profile.email}</p>
        <nav className="flex flex-col gap-1 text-sm">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-2 py-1.5 rounded-md hover:bg-gray-100 whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 sm:p-6 min-w-0">{children}</main>
    </div>
  );
}
