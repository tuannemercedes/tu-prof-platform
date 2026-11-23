"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import SignOutButton from "./sign-out-button";
import ThemeToggle from "./theme-toggle";
import Logo from "./logo";
import NotificationBell from "./notification-bell";
import ChaveIdioma from "./chave-idioma";
import type { Novidade } from "@/lib/notificacoes";

type Props = {
  nome: string;
  idioma: { atual: "espanhol" | "ingles"; opcoes: ("espanhol" | "ingles")[] };
  novidades?: Novidade[];
  appUrl?: string | null;
  appLabel?: string | null;
  contatoUrl?: string | null;
  contatoLabel?: string | null;
};

const ICONES: Record<string, React.ReactNode> = {
  inicio: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  trilha: (
    <>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6" />
    </>
  ),
  plano: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  biblioteca: (
    <>
      <path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 19a2 2 0 0 0 2 2h13" />
    </>
  ),
  evolucao: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
};

const ITENS = [
  { chave: "inicio", href: "/aluno", label: "Início", ativo: (p: string) => p === "/aluno" },
  {
    chave: "trilha",
    href: "/aluno/trilha",
    label: "Trilha",
    ativo: (p: string) => p.startsWith("/aluno/trilha") || p.startsWith("/aluno/materias"),
  },
  {
    chave: "plano",
    href: "/aluno/plano",
    label: "Plano",
    ativo: (p: string) =>
      ["/aluno/plano", "/aluno/planner", "/aluno/cronograma", "/aluno/calendario", "/aluno/clube"].some((r) =>
        p.startsWith(r)
      ),
  },
  {
    chave: "biblioteca",
    href: "/aluno/acervo",
    label: "Acervo",
    ativo: (p: string) =>
      ["/aluno/acervo", "/aluno/biblioteca", "/aluno/busca", "/aluno/glossario"].some((r) => p.startsWith(r)),
  },
  {
    chave: "evolucao",
    href: "/aluno/evolucao",
    label: "Evolução",
    ativo: (p: string) => p.startsWith("/aluno/evolucao") || p.startsWith("/aluno/perfil"),
  },
];

function Icone({ nome, ativo }: { nome: string; ativo: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={ativo ? "var(--gold)" : "currentColor"}
      strokeWidth={ativo ? 1.9 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONES[nome]}
    </svg>
  );
}

function LinksExtras({ appUrl, appLabel, contatoUrl, contatoLabel }: Omit<Props, "nome" | "novidades" | "idioma">) {
  return (
    <>
      {appUrl && (
        <a
          href={appUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center rounded-xl bg-[var(--gold)] text-[var(--navy)] text-sm font-semibold px-3 py-2.5 hover:bg-[var(--gold-light)] transition-colors"
        >
          {appLabel || "UZUS · seu simulador"} ↗
        </a>
      )}
      {contatoUrl && (
        <a
          href={contatoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center rounded-xl border border-current text-sm font-semibold px-3 py-2.5 opacity-90 hover:opacity-100"
        >
          {contatoLabel || "Fale com a sua professora"} ↗
        </a>
      )}
    </>
  );
}

export default function AlunoNav({ nome, novidades = [], idioma, ...extras }: Props) {
  const pathname = usePathname();
  const [maisAberto, setMaisAberto] = useState(false);

  return (
    <>
      {/* ===== Computador: barra lateral azul-marinho ===== */}
      <aside className="hidden sm:flex sm:w-64 shrink-0 flex-col gap-8 bg-[var(--navy)] text-[var(--on-navy)] px-5 py-7 sm:h-screen sm:sticky sm:top-0 overflow-y-auto">
        <div className="space-y-1 px-2">
          <Logo className="text-2xl" />
          <p className="text-xs text-[var(--on-navy-muted)] truncate">Olá, {nome}</p>
          {idioma.opcoes.length > 1 && (
            <div className="pt-3">
              <ChaveIdioma atual={idioma.atual} opcoes={idioma.opcoes} />
            </div>
          )}
        </div>

        <nav aria-label="Menu principal" className="flex flex-col gap-1">
          {ITENS.map((item) => {
            const ativo = item.ativo(pathname);
            return (
              <Link
                key={item.chave}
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`flex items-center gap-3 h-11 px-3 rounded-xl text-[15px] transition-colors ${
                  ativo
                    ? "bg-[var(--navy-2)] text-white font-semibold"
                    : "text-[var(--on-navy-muted)] hover:bg-[var(--navy-2)] hover:text-white"
                }`}
              >
                <Icone nome={item.chave} ativo={ativo} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <LinksExtras {...extras} />
          <div className="flex items-center justify-between gap-2 px-2 pt-3 border-t border-[var(--navy-2)] text-[var(--on-navy-muted)]">
            <Link href="/aluno/perfil" className="text-sm hover:text-white">
              Meu perfil
            </Link>
            <div className="flex items-center gap-3">
              <NotificationBell novidades={novidades} />
              <ThemeToggle />
            </div>
          </div>
          <div className="px-2 [&_button]:!text-[var(--on-navy-muted)]">
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* ===== Celular: barra do topo ===== */}
      <header className="sm:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-[var(--navy)] text-[var(--on-navy)]">
        <Logo className="text-xl" />
        <div className="flex items-center gap-2">
          <NotificationBell novidades={novidades} />
          <button
            type="button"
            onClick={() => setMaisAberto(true)}
            aria-label="Mais opções"
            className="w-11 h-11 flex items-center justify-center rounded-full"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="12" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="19" cy="12" r="1.8" />
            </svg>
          </button>
        </div>
      </header>
      {idioma.opcoes.length > 1 && (
        <div className="sm:hidden sticky top-14 z-20 flex justify-center pb-2.5 bg-[var(--navy)]">
          <ChaveIdioma atual={idioma.atual} opcoes={idioma.opcoes} />
        </div>
      )}

      {maisAberto && (
        <div className="sm:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Mais opções">
          <button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMaisAberto(false)}
          />
          <div
            className="absolute bottom-0 inset-x-0 rounded-t-3xl bg-[var(--navy)] text-[var(--on-navy)] p-6 pb-10 space-y-4"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setMaisAberto(false);
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--on-navy-muted)]">Olá, {nome}</p>
              <ThemeToggle />
            </div>
            <LinksExtras {...extras} />
            <Link href="/aluno/perfil" className="block text-sm py-2">
              Meu perfil
            </Link>
            <div className="[&_button]:!text-[var(--on-navy-muted)]">
              <SignOutButton />
            </div>
          </div>
        </div>
      )}

      {/* ===== Celular: abas de baixo ===== */}
      <nav
        aria-label="Menu principal"
        className="sm:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 bg-[var(--surface)] border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)]"
      >
        {ITENS.map((item) => {
          const ativo = item.ativo(pathname);
          return (
            <Link
              key={item.chave}
              href={item.href}
              aria-current={ativo ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 h-16 text-[11px] ${
                ativo ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-secondary)]"
              }`}
            >
              <Icone nome={item.chave} ativo={ativo} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
