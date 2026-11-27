"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// Barra fixa no topo das telas internas (módulo, aula, glossário, relatório…):
// botão "Voltar" sempre à mão e o caminho de onde a pessoa está.
// Nas seções principais (Início, Trilha, Plano, Acervo, Cartas, Evolução) ela não aparece.

type Pai = { href: string; label: string; aqui: string };

function paiDe(caminho: string): Pai | null {
  if (/^\/materias\/[^/]+/.test(caminho)) return { href: "/trilha", label: "Trilha", aqui: "Módulo" };
  if (/^\/aula\/[^/]+/.test(caminho)) return { href: "/plano", label: "Meu plano", aqui: "Aula" };
  if (caminho.startsWith("/glossario")) return { href: "/acervo?aba=biblioteca", label: "Biblioteca", aqui: "Glossário" };
  if (/^\/relatorios\//.test(caminho)) return { href: "/evolucao", label: "Evolução", aqui: "Relatório do mês" };
  if (caminho.startsWith("/cronograma")) return { href: "/plano", label: "Meu plano", aqui: "Cronograma" };
  if (caminho.startsWith("/calendario")) return { href: "/plano", label: "Meu plano", aqui: "Calendário" };
  if (caminho.startsWith("/clube")) return { href: "/plano", label: "Meu plano", aqui: "Club" };
  if (caminho.startsWith("/busca")) return { href: "", label: "Início", aqui: "Busca" };
  if (caminho.startsWith("/perfil")) return { href: "", label: "Início", aqui: "Meu perfil" };
  return null;
}

// Guarda se a pessoa já navegou dentro da plataforma nesta aba (para o "Voltar" usar o histórico).
let navegouAqui = false;
let ultimo: string | null = null;

export default function BarraVoltar({ base }: { base: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const idioma = useSearchParams().get("idioma");

  useEffect(() => {
    if (ultimo && ultimo !== pathname) navegouAqui = true;
    ultimo = pathname;
  }, [pathname]);

  const caminho = pathname.startsWith(base) ? pathname.slice(base.length) || "/" : pathname;
  const pai = paiDe(caminho);
  if (!pai) return null;

  const comIdioma = (href: string) => {
    const url = `${base}${href}`;
    if (!idioma) return url || "/";
    return `${url}${url.includes("?") ? "&" : "?"}idioma=${idioma}`;
  };
  const hrefPai = comIdioma(pai.href);

  return (
    <div className="sticky top-0 z-30 -mx-4 sm:-mx-10 -mt-6 sm:-mt-10 mb-5 px-4 sm:px-10 py-2.5 bg-[var(--bg)]/85 backdrop-blur border-b border-[var(--border)]">
      <div className="max-w-5xl mx-auto flex items-center gap-3">
        <button
          type="button"
          onClick={() => (navegouAqui ? router.back() : router.push(hrefPai))}
          className="inline-flex items-center gap-1.5 h-9 pl-2.5 pr-3.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] text-sm font-semibold hover:border-[var(--gold)]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Voltar
        </button>
        <nav aria-label="Você está em" className="min-w-0 flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
          <Link href={hrefPai} className="hover:text-[var(--text-primary)] hover:underline underline-offset-2 truncate">
            {pai.label}
          </Link>
          <span aria-hidden="true">›</span>
          <span className="font-medium text-[var(--text-primary)] truncate">{pai.aqui}</span>
        </nav>
      </div>
    </div>
  );
}
