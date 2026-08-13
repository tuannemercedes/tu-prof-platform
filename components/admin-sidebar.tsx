"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import SignOutButton from "./sign-out-button";

const NAV_ITEMS = [
  { href: "/admin", label: "Início" },
  { href: "/admin/turmas", label: "Turmas" },
  { href: "/admin/alunos", label: "Alunos" },
  { href: "/admin/materias", label: "Matérias" },
  { href: "/admin/fia", label: "FIA" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  function fecharAoClicarLink(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("a")) setMenuAberto(false);
  }

  return (
    <>
      <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <p className="font-semibold">Tu Prof</p>
        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
          className="text-xl leading-none px-2 py-1"
        >
          ☰
        </button>
      </div>

      {menuAberto && (
        <div
          className="sm:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <aside
        onClick={fecharAoClicarLink}
        className={`fixed sm:static inset-y-0 left-0 z-50 w-72 sm:w-56 bg-white shrink-0 border-r border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto sm:h-screen sm:sticky sm:top-0 transform transition-transform duration-200 ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold hidden sm:block">Tu Prof</p>
            <p className="text-xs text-gray-500">Painel do admin</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <SignOutButton />
            <button
              type="button"
              onClick={() => setMenuAberto(false)}
              aria-label="Fechar menu"
              className="sm:hidden text-lg leading-none px-1"
            >
              ✕
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 truncate -mt-2">{email}</p>
        <nav className="flex flex-col gap-1 text-sm">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 py-1.5 rounded-md whitespace-nowrap ${
                  active ? "bg-black text-white" : "hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
