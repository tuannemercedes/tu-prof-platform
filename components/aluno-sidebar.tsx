"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import SignOutButton from "./sign-out-button";
import ThemeToggle from "./theme-toggle";

type MaterialStatus = { id: string; titulo: string; concluido: boolean };
type Fase = { id: string; titulo: string; materiais: MaterialStatus[] };
type Trilha = {
  id: string;
  titulo: string;
  fases: Fase[];
  materiaisSemFase: MaterialStatus[];
};
type SimpleMateria = { id: string; titulo: string };

type Props = {
  nome: string;
  trilhas: Trilha[];
  fia: SimpleMateria[];
  appUrl?: string | null;
  appLabel?: string | null;
  contatoUrl?: string | null;
  contatoLabel?: string | null;
};

function faseProgresso(fase: Fase) {
  const total = fase.materiais.length;
  const concluidos = fase.materiais.filter((m) => m.concluido).length;
  return { total, concluidos, pct: total ? Math.round((concluidos / total) * 100) : 0 };
}

export default function AlunoSidebar({
  nome,
  trilhas,
  fia,
  appUrl,
  appLabel,
  contatoUrl,
  contatoLabel,
}: Props) {
  const pathname = usePathname();
  const [expandido, setExpandido] = useState<string | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);

  function linkClass(href: string) {
    const active = pathname === href;
    return `block px-2 py-1.5 rounded-md text-sm whitespace-nowrap ${
      active ? "bg-[var(--accent)] text-[var(--accent-contrast)]" : "hover:bg-[var(--surface-3)]"
    }`;
  }

  function fecharAoClicarLink(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("a")) setMenuAberto(false);
  }

  return (
    <>
      <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <p className="font-semibold">Tu Prof</p>
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
        className={`fixed sm:static inset-y-0 left-0 z-50 w-72 sm:w-64 bg-[var(--surface)] shrink-0 border-r border-[var(--border)] p-4 flex flex-col gap-6 overflow-y-auto sm:h-screen sm:sticky sm:top-0 transform transition-transform duration-200 ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
      >
        <div className="relative flex items-start justify-between gap-2">
          <div
            className="glow-spot hidden sm:block -left-6 -top-6 w-24 h-24"
            style={{ background: "var(--glow-secondary)" }}
          />
          <div className="min-w-0 relative">
            <p className="font-semibold hidden sm:block">Tu Prof</p>
            <p className="text-xs text-[var(--text-secondary)] truncate">Olá, {nome}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-xs text-[var(--text-secondary)] pt-0.5 relative">
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

        <nav className="flex flex-col gap-1">
          <Link href="/aluno" className={linkClass("/aluno")}>
            Início
          </Link>
          <Link href="/aluno/cronograma" className={linkClass("/aluno/cronograma")}>
            Cronograma
          </Link>
          <Link href="/aluno/planner" className={linkClass("/aluno/planner")}>
            Planner
          </Link>
          <Link href="/aluno/calendario" className={linkClass("/aluno/calendario")}>
            Calendário
          </Link>
        </nav>

        {trilhas.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wide mb-1 px-2">
              Trilhas de aprendizagem
            </p>
            <nav className="flex flex-col gap-1">
              {trilhas.map((t) => {
                const aberta = expandido === t.id;
                const totalMateriais =
                  t.fases.reduce((acc, f) => acc + f.materiais.length, 0) + t.materiaisSemFase.length;
                const totalConcluidos =
                  t.fases.reduce((acc, f) => acc + f.materiais.filter((m) => m.concluido).length, 0) +
                  t.materiaisSemFase.filter((m) => m.concluido).length;

                return (
                  <div key={t.id}>
                    <button
                      type="button"
                      onClick={() => setExpandido(aberta ? null : t.id)}
                      className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-[var(--surface-3)]"
                    >
                      <span className="truncate">{t.titulo}</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-[var(--text-faint)]">
                          {totalConcluidos}/{totalMateriais}
                        </span>
                        <span className={`text-[var(--text-faint)] transition-transform ${aberta ? "rotate-90" : ""}`}>
                          ›
                        </span>
                      </span>
                    </button>

                    {aberta && (
                      <div className="ml-2 pl-2 border-l border-[var(--border)] space-y-2 py-1">
                        {t.fases.map((fase) => {
                          const { total, concluidos, pct } = faseProgresso(fase);
                          return (
                            <div key={fase.id} className="space-y-1">
                              <div className="px-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-medium text-[var(--text-secondary)]">{fase.titulo}</p>
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                      pct === 100
                                        ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                                        : pct > 0
                                          ? "bg-[var(--info-bg)] text-[var(--info-text)]"
                                          : "bg-[var(--surface-3)] text-[var(--text-secondary)]"
                                    }`}
                                  >
                                    {pct === 100 ? "Concluído" : pct > 0 ? "Em progresso" : "A começar"}
                                  </span>
                                </div>
                                <div className="h-1 rounded-full bg-[var(--surface-3)] overflow-hidden mt-1">
                                  <div
                                    className="h-full bg-[var(--accent)] rounded-full"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col">
                                {fase.materiais.map((m) => (
                                  <Link
                                    key={m.id}
                                    href={`/aluno/materias/${t.id}#material-${m.id}`}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:bg-[var(--surface-3)] text-[var(--text-secondary)]"
                                  >
                                    <span className={m.concluido ? "text-[var(--success-text)]" : "text-[var(--text-faint)]"}>
                                      {m.concluido ? "✓" : "○"}
                                    </span>
                                    <span className="truncate">{m.titulo}</span>
                                  </Link>
                                ))}
                                {concluidos === total && total === 0 && (
                                  <p className="px-2 text-xs text-[var(--text-faint)]">Nenhuma aula ainda.</p>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {t.materiaisSemFase.length > 0 && (
                          <div className="flex flex-col">
                            {t.materiaisSemFase.map((m) => (
                              <Link
                                key={m.id}
                                href={`/aluno/materias/${t.id}#material-${m.id}`}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:bg-[var(--surface-3)] text-[var(--text-secondary)]"
                              >
                                <span className={m.concluido ? "text-[var(--success-text)]" : "text-[var(--text-faint)]"}>
                                  {m.concluido ? "✓" : "○"}
                                </span>
                                <span className="truncate">{m.titulo}</span>
                              </Link>
                            ))}
                          </div>
                        )}

                        <Link
                          href={`/aluno/materias/${t.id}`}
                          className="block px-2 py-1 text-xs text-[var(--text-secondary)] hover:underline"
                        >
                          Ver trilha completa →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        )}

        {fia.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wide mb-1 px-2">
              FIA
            </p>
            <nav className="flex flex-col gap-1">
              {fia.map((t) => (
                <Link key={t.id} href={`/aluno/materias/${t.id}`} className={linkClass(`/aluno/materias/${t.id}`)}>
                  {t.titulo}
                </Link>
              ))}
            </nav>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-[var(--border-soft)] space-y-3">
          <Link href="/aluno/perfil" className={linkClass("/aluno/perfil")}>
            Meu perfil
          </Link>

          {contatoUrl && (
            <a
              href={contatoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-3 py-2.5 hover:bg-[var(--accent-hover)] transition-colors btn-glow"
            >
              {contatoLabel || "Fale comigo"} ↗
            </a>
          )}
          {appUrl && (
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-3 py-2.5 hover:bg-[var(--accent-hover)] transition-colors btn-glow"
            >
              {appLabel || "UZUS - Seu simulador"} ↗
            </a>
          )}
        </div>
      </aside>
    </>
  );
}
