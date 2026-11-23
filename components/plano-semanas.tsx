"use client";

import Link from "next/link";
import { useState } from "react";
import TarefaItem from "./tarefa-item";
import { formatarPrazo, type TarefaAluno } from "@/lib/tarefas";

export type Semana = {
  inicio: string;
  rotulo: string;
  intervalo: string;
  aulas: { id: string; quando: string; tema: string; descricao: string | null; realizada: boolean }[];
  tarefas: TarefaAluno[];
  club: { id: string; tema: string; quando: string }[];
};

function Marcador({ tipo, ultimo }: { tipo: "aula" | "tarefa" | "club"; ultimo?: boolean }) {
  const bola =
    tipo === "aula"
      ? "bg-[var(--accent)]"
      : tipo === "tarefa"
        ? "bg-[var(--gold)]"
        : "border-2 border-[var(--gold-text)] box-border";
  return (
    <div className="flex flex-col items-center w-3.5 shrink-0">
      <span className={`w-3.5 h-3.5 rounded-full mt-1 ${bola}`} />
      {!ultimo && <span className="flex-1 w-0.5 bg-[var(--border-strong)] opacity-60" />}
    </div>
  );
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs tracking-[0.08em] uppercase text-[var(--text-secondary)] font-semibold">{children}</span>
  );
}

export default function PlanoSemanas({
  semanas,
  indiceInicial,
  alunoId,
  previa = false,
}: {
  semanas: Semana[];
  indiceInicial: number;
  alunoId: string;
  previa?: boolean;
  proximaSegunda: string;
}) {
  const [i, setI] = useState(Math.max(0, indiceInicial));
  const s = semanas[i];
  const temClub = s.club.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-1.5">
        <button
          type="button"
          onClick={() => setI(Math.max(0, i - 1))}
          disabled={i === 0}
          aria-label="Semana anterior"
          className="w-11 h-11 rounded-[10px] bg-[var(--surface-2)] flex items-center justify-center disabled:opacity-40"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <div className="flex flex-col items-center gap-0.5 text-center" aria-live="polite">
          <span className="text-[15px] font-semibold">{s.rotulo}</span>
          <span className="text-xs text-[var(--text-secondary)]">{s.intervalo}</span>
        </div>
        <button
          type="button"
          onClick={() => setI(Math.min(semanas.length - 1, i + 1))}
          disabled={i === semanas.length - 1}
          aria-label="Próxima semana"
          className="w-11 h-11 rounded-[10px] bg-[var(--surface-2)] flex items-center justify-center disabled:opacity-40"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col">
        <div className="flex gap-3.5">
          <Marcador tipo="aula" />
          <div className="flex-1 pb-5 flex flex-col gap-2">
            {s.aulas.length ? (
              s.aulas.map((a) => (
                <div key={a.id} className="flex flex-col gap-2">
                  <Rotulo>
                    Aula · {a.quando}
                    {a.realizada ? " · realizada" : ""}
                  </Rotulo>
                  <div className="bg-[var(--navy)] text-[var(--on-navy)] rounded-2xl p-4 flex flex-col gap-1.5">
                    <span className="font-serif text-[22px] font-semibold">{a.tema}</span>
                    {a.descricao && <span className="text-[13px] text-[var(--on-navy-muted)]">{a.descricao}</span>}
                  </div>
                </div>
              ))
            ) : (
              <>
                <Rotulo>Aula</Rotulo>
                <p className="m-0 text-sm text-[var(--text-secondary)]">Sem aula marcada nesta semana.</p>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-3.5">
          <Marcador tipo="tarefa" ultimo={!temClub} />
          <div className="flex-1 pb-5 flex flex-col gap-2">
            <Rotulo>Tarefas</Rotulo>
            {s.tarefas.length ? (
              s.tarefas.map((t) => (
                <TarefaItem key={t.id} tarefa={t} alunoId={alunoId} previa={previa} meta={formatarPrazo(t.prazo) ?? t.origem} />
              ))
            ) : (
              <p className="m-0 text-sm text-[var(--text-secondary)]">Nenhuma tarefa nesta semana.</p>
            )}
          </div>
        </div>

        {temClub && (
          <div className="flex gap-3.5">
            <Marcador tipo="club" ultimo />
            <div className="flex-1 flex flex-col gap-2">
              {s.club.map((c) => (
                <div key={c.id} className="flex flex-col gap-2">
                  <Rotulo>Club Hispano · {c.quando}</Rotulo>
                  <Link
                    href={previa ? "#" : "/aluno/clube"}
                    className="bg-[var(--warning-bg)] rounded-xl p-3.5 flex flex-col gap-1"
                  >
                    <span className="text-[15px] font-semibold">{c.tema}</span>
                    <span className="text-[13px] text-[var(--text-secondary)]">Opcional · conversa ao vivo</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
