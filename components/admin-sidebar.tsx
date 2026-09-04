"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import SignOutButton from "./sign-out-button";
import ThemeToggle from "./theme-toggle";
import Logo from "./logo";

const NAV_ITEMS = [
  { href: "/admin", label: "Início" },
  { href: "/admin/turmas", label: "Turmas" },
  { href: "/admin/alunos", label: "Alunos" },
  { href: "/admin/materias", label: "Matérias" },
  { href: "/admin/fia", label: "FIA" },
  { href: "/admin/cronograma", label: "Cronograma" },
  { href: "/admin/planner", label: "Planner" },
  { href: "/admin/clube", label: "Clube de Conversação" },
  { href: "/admin/glossario", label: "Glossário" },
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
      <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            className="text-xl leading-none px-2 py-1"
          >
            ☰
          </button>
        </div>
      </div>

      {menuAberto && (
        <div
          className="sm:hidden fixed inset-0 bg-[var(--accent)]/30 z-40"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <aside
        onClick={fecharAoClicarLink}
        className={`fixed sm:static inset-y-0 left-0 z-50 w-72 sm:w-56 bg-[var(--surface)] shrink-0 border-r border-[var(--border)] p-4 flex flex-col gap-4 overflow-y-auto sm:h-screen sm:sticky sm:top-0 transform transition-transform duration-200 ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
      >
        <div className="relative flex items-start justify-between gap-2">
          <div
            className="glow-spot hidden sm:block -left-6 -top-6 w-24 h-24"
            style={{ background: "var(--glow-secondary)" }}
          />
          <div className="min-w-0 relative">
            <Logo className="hidden sm:inline-block" />
            <p className="text-xs text-[var(--text-secondary)]">Painel do admin</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 relative">
            <ThemeToggle />
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
        <p className="text-xs text-[var(--text-secondary)] truncate -mt-2">{email}</p>
        <nav className="flex flex-col gap-1 text-sm">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 py-1.5 rounded-md whitespace-nowrap ${
                  active ? "bg-[var(--accent)] text-[var(--accent-contrast)]" : "hover:bg-[var(--surface-3)]"
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
