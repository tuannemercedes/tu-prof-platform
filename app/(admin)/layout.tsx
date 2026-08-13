import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import SignOutButton from "@/components/sign-out-button";

const NAV_ITEMS = [
  { href: "/admin", label: "Início" },
  { href: "/admin/turmas", label: "Turmas" },
  { href: "/admin/alunos", label: "Alunos" },
  { href: "/admin/materias", label: "Matérias" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAdmin();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-gray-200 p-4 flex md:flex-col gap-4">
        <div className="flex-1 md:flex-none">
          <p className="font-semibold">Tu Prof</p>
          <p className="text-xs text-gray-500">Painel do admin</p>
        </div>
        <nav className="flex md:flex-col gap-1 text-sm overflow-x-auto">
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
        <div className="md:mt-auto text-xs text-gray-500 space-y-1 flex md:block items-center gap-2">
          <p className="truncate">{profile.email}</p>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
