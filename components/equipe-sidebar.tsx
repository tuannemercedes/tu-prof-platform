"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./logo";
import SignOutButton from "./sign-out-button";
import ThemeToggle from "./theme-toggle";

const ICONES: Record<string, React.ReactNode> = {
  inicio: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  pessoas: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <circle cx="17.5" cy="9" r="2.5" />
      <path d="M16 14.5a5 5 0 0 1 5.5 5" />
    </>
  ),
  programas: (
    <>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6" />
    </>
  ),
  empresas: (
    <>
      <rect x="4" y="3" width="11" height="18" rx="1" />
      <path d="M15 9h4a1 1 0 0 1 1 1v11H15M8 7h3M8 11h3M8 15h3" />
    </>
  ),
  biblioteca: (
    <>
      <path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 19a2 2 0 0 0 2 2h13" />
    </>
  ),
  config: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
};

type Item = { chave: string; href: string; label: string; ativo: (p: string) => boolean };

const ITENS_ADMIN: Item[] = [
  { chave: "inicio", href: "/admin", label: "Início", ativo: (p) => p === "/admin" },
  { chave: "pessoas", href: "/admin/alunos", label: "Pessoas", ativo: (p) => p.startsWith("/admin/alunos") },
  {
    chave: "programas",
    href: "/admin/turmas",
    label: "Programas",
    ativo: (p) => ["/admin/turmas", "/admin/aulas", "/admin/materias"].some((r) => p.startsWith(r)),
  },
  { chave: "empresas", href: "/admin/empresas", label: "Empresas", ativo: (p) => p.startsWith("/admin/empresas") },
  {
    chave: "biblioteca",
    href: "/admin/biblioteca",
    label: "Acervo",
    ativo: (p) => ["/admin/biblioteca", "/admin/fia", "/admin/glossario"].some((r) => p.startsWith(r)),
  },
  {
    chave: "config",
    href: "/admin/configuracoes",
    label: "Configurações",
    ativo: (p) => ["/admin/configuracoes", "/admin/clube", "/admin/planner", "/admin/cronograma"].some((r) => p.startsWith(r)),
  },
];

const ITENS_PROFESSOR: Item[] = [
  ITENS_ADMIN[0],
  { ...ITENS_ADMIN[1], label: "Meus alunos" },
];

export default function EquipeSidebar({ nome, papel }: { nome: string; papel: string }) {
  const pathname = usePathname();
  const itens = papel === "admin" ? ITENS_ADMIN : ITENS_PROFESSOR;
  const iniciais = nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <aside className="flex-[1_1_232px] max-w-full sm:max-w-[260px] box-border bg-[var(--navy)] text-[var(--on-navy)] px-[18px] py-7 flex flex-col gap-7 sm:min-h-screen sm:sticky sm:top-0 sm:h-screen">
      <div className="ml-2.5">
        <Logo className="text-[28px]" />
      </div>
      <nav aria-label="Menu da equipe" className="flex flex-col gap-1">
        {itens.map((item) => {
          const ativo = item.ativo(pathname);
          return (
            <Link
              key={item.chave}
              href={item.href}
              aria-current={ativo ? "page" : undefined}
              className={`flex items-center gap-3 h-11 px-3 rounded-[10px] text-[15px] ${
                ativo ? "bg-[#1e3360] text-white font-semibold" : "text-[var(--on-navy-muted)] hover:text-white"
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ativo ? "#d9b866" : "currentColor"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {ICONES[item.chave]}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-3">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--navy-2)]">
          <span className="w-9 h-9 shrink-0 rounded-full bg-[var(--gold)] text-[var(--navy)] font-semibold flex items-center justify-center">
            {iniciais || "TP"}
          </span>
          <span className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate">{nome}</span>
            <span className="text-xs text-[var(--on-navy-muted)]">{papel === "admin" ? "Fundadora · admin" : "Professor"}</span>
          </span>
        </div>
        <div className="flex items-center justify-between px-1 [&_button]:!text-[var(--on-navy-muted)]">
          <SignOutButton />
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
