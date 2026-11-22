"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  { href: "/aluno/planner", label: "Tarefas" },
  { href: "/aluno/cronograma", label: "Aulas" },
  { href: "/aluno/calendario", label: "Calendário" },
  { href: "/aluno/clube", label: "Club Hispano" },
];

// Por enquanto o Plano junta as páginas que já existiam numa navegação só.
// Na Etapa 3 elas viram uma linha do tempo única por semana.
export default function PlanoAbas() {
  const pathname = usePathname();
  return (
    <nav aria-label="Seções do plano" className="flex gap-2 overflow-x-auto pb-1 mb-6 -mt-2">
      {ABAS.map((aba) => {
        const ativo = pathname.startsWith(aba.href);
        return (
          <Link
            key={aba.href}
            href={aba.href}
            aria-current={ativo ? "page" : undefined}
            className={`shrink-0 h-10 px-4 rounded-full text-sm font-medium flex items-center border transition-colors ${
              ativo
                ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]"
                : "bg-[var(--surface)] border-[var(--border-strong)] hover:border-[var(--accent)]"
            }`}
          >
            {aba.label}
          </Link>
        );
      })}
    </nav>
  );
}
