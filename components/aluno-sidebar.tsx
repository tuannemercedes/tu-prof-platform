"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import SignOutButton from "./sign-out-button";

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

  function linkClass(href: string) {
    const active = pathname === href;
    return `block px-2 py-1.5 rounded-md text-sm whitespace-nowrap ${
      active ? "bg-black text-white" : "hover:bg-gray-100"
    }`;
  }

  return (
    <aside className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-gray-200 p-4 flex flex-col gap-6 md:h-screen md:sticky md:top-0 md:overflow-y-auto">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold">Tu Prof</p>
          <p className="text-xs text-gray-500 truncate">Olá, {nome}</p>
        </div>
        <div className="text-xs text-gray-500 shrink-0 pt-0.5">
          <SignOutButton />
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
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 px-2">
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
                    className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100"
                  >
                    <span className="truncate">{t.titulo}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-gray-400">
                        {totalConcluidos}/{totalMateriais}
                      </span>
                      <span className={`text-gray-400 transition-transform ${aberta ? "rotate-90" : ""}`}>
                        ›
                      </span>
                    </span>
                  </button>

                  {aberta && (
                    <div className="ml-2 pl-2 border-l border-gray-200 space-y-2 py-1">
                      {t.fases.map((fase) => {
                        const { total, concluidos, pct } = faseProgresso(fase);
                        return (
                          <div key={fase.id} className="space-y-1">
                            <div className="px-2">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-600">{fase.titulo}</p>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                    pct === 100
                                      ? "bg-green-100 text-green-700"
                                      : pct > 0
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {pct === 100 ? "Concluído" : pct > 0 ? "Em progresso" : "A começar"}
                                </span>
                              </div>
                              <div className="h-1 rounded-full bg-gray-100 overflow-hidden mt-1">
                                <div
                                  className="h-full bg-black rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex flex-col">
                              {fase.materiais.map((m) => (
                                <Link
                                  key={m.id}
                                  href={`/aluno/materias/${t.id}#material-${m.id}`}
                                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:bg-gray-100 text-gray-600"
                                >
                                  <span className={m.concluido ? "text-green-600" : "text-gray-300"}>
                                    {m.concluido ? "✓" : "○"}
                                  </span>
                                  <span className="truncate">{m.titulo}</span>
                                </Link>
                              ))}
                              {concluidos === total && total === 0 && (
                                <p className="px-2 text-xs text-gray-400">Nenhuma aula ainda.</p>
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
                              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:bg-gray-100 text-gray-600"
                            >
                              <span className={m.concluido ? "text-green-600" : "text-gray-300"}>
                                {m.concluido ? "✓" : "○"}
                              </span>
                              <span className="truncate">{m.titulo}</span>
                            </Link>
                          ))}
                        </div>
                      )}

                      <Link
                        href={`/aluno/materias/${t.id}`}
                        className="block px-2 py-1 text-xs text-gray-500 hover:underline"
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
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 px-2">
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

      <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
        <Link href="/aluno/perfil" className={linkClass("/aluno/perfil")}>
          Meu perfil
        </Link>

        {contatoUrl && (
          <a
            href={contatoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center rounded-md bg-black text-white text-sm font-medium px-3 py-2.5 hover:bg-gray-800 transition-colors"
          >
            {contatoLabel || "Fale comigo"} ↗
          </a>
        )}
        {appUrl && (
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center rounded-md bg-black text-white text-sm font-medium px-3 py-2.5 hover:bg-gray-800 transition-colors"
          >
            {appLabel || "UZUS - Seu simulador"} ↗
          </a>
        )}
      </div>
    </aside>
  );
}
