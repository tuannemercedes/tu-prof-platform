"use client";

import { useState, useTransition } from "react";
import { salvarCheckpoint } from "@/app/(admin)/admin/alunos/[id]/actions";
import { NIVEIS } from "@/lib/evolucao";

type Props = {
  alunoId: string;
  competencias: string[];
  iniciais: Record<string, number>;
  numero: number;
  idioma: "espanhol" | "ingles" | null;
};

export default function CheckpointForm({ alunoId, competencias, iniciais, numero, idioma }: Props) {
  const [niveis, setNiveis] = useState<Record<string, number>>(iniciais);
  const [comentario, setComentario] = useState("");
  const [titulo, setTitulo] = useState(numero === 1 ? "Diagnóstico inicial" : `Checkpoint ${numero - 1}`);
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function salvar() {
    setMsg(null);
    startTransition(async () => {
      const r = await salvarCheckpoint(alunoId, niveis, comentario, titulo, idioma);
      if (r?.error) setMsg({ ok: false, texto: r.error });
      else {
        setComentario("");
        setMsg({ ok: true, texto: "Checkpoint salvo. O aluno já vê em Evolução." });
      }
    });
  }

  return (
    <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-[22px] flex flex-col gap-4">
      <h2 className="m-0 font-serif font-semibold text-[26px]">Novo checkpoint</h2>
      <label className="flex flex-col gap-1.5 text-[13px] font-semibold max-w-sm">
        Nome
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="h-[42px] rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[15px] font-normal"
        />
      </label>
      {competencias.map((c) => (
        <div key={c} className="flex flex-wrap gap-3 items-center justify-between py-2 border-b border-[var(--border-soft)]">
          <span className="text-[15px] font-semibold">{c}</span>
          <div className="flex gap-1.5" role="group" aria-label={c}>
            {NIVEIS.map((n) => {
              const on = niveis[c] === n.valor;
              return (
                <button
                  key={n.valor}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setNiveis({ ...niveis, [c]: n.valor })}
                  className={`h-[38px] px-3 rounded-full text-[13px] font-medium border ${
                    on
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]"
                      : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border-strong)]"
                  }`}
                >
                  {n.rotulo}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
        Comentário para o aluno
        <textarea
          rows={3}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="O que melhorou e qual é o próximo foco"
          className="rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-3 text-[15px] font-normal"
        />
      </label>
      <p className="m-0 text-[13px] text-[var(--text-secondary)]">
        Esses checkpoints viram o relatório do aluno e, no Corporate, o relatório enviado à empresa.
      </p>
      <div className="flex items-center gap-3.5 flex-wrap">
        <button
          type="button"
          onClick={salvar}
          disabled={isPending}
          className="h-[46px] px-[22px] rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-[15px] disabled:opacity-60"
        >
          {isPending ? "Salvando..." : "Salvar checkpoint"}
        </button>
        {msg && (
          <span role="status" className={`text-sm font-semibold ${msg.ok ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}`}>
            {msg.texto}
          </span>
        )}
      </div>
    </section>
  );
}
