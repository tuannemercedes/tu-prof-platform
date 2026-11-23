"use client";

import { useRef, useState, useTransition } from "react";
import { salvarEntrega } from "@/app/(aluno)/aluno/tarefas/actions";
import { createClient } from "@/lib/supabase/client";
import type { TarefaAluno } from "@/lib/tarefas";

type Props = {
  tarefa: TarefaAluno;
  alunoId: string;
  meta?: string | null;
  compacta?: boolean;
  previa?: boolean;
};

const AJUDA: Record<string, string> = {
  texto: "Escreva a sua resposta aqui",
  audio: "Grave um áudio pelo celular",
  link: "A atividade é feita fora da plataforma",
};

export default function TarefaItem({ tarefa, alunoId, meta, compacta = false, previa = false }: Props) {
  const [feita, setFeita] = useState(tarefa.concluida);
  const [aberta, setAberta] = useState(false);
  const [resposta, setResposta] = useState(tarefa.resposta ?? "");
  const [temAudio, setTemAudio] = useState(!!tarefa.arquivoPath);
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const arquivoRef = useRef<HTMLInputElement>(null);

  const simples = tarefa.entrega === "feito";

  function marcar(valor: boolean, extra: { resposta?: string; arquivoPath?: string } = {}) {
    setErro(null);
    setFeita(valor);
    if (previa) {
      // Prévia da equipe: mostra o efeito, mas não grava nada para o aluno.
      if (valor) setAberta(false);
      return;
    }
    startTransition(async () => {
      const r = await salvarEntrega(tarefa.id, { concluida: valor, ...extra });
      if (r?.error) {
        setErro(r.error);
        setFeita(!valor);
      } else if (valor) {
        setAberta(false);
      }
    });
  }

  function clicarCaixa() {
    if (simples || feita) marcar(!feita);
    else setAberta((a) => !a);
  }

  async function enviarAudio(arquivo: File) {
    setErro(null);
    if (previa) {
      setTemAudio(true);
      marcar(true);
      return;
    }
    const supabase = createClient();
    const ext = arquivo.name.split(".").pop() || "m4a";
    const caminho = `${alunoId}/${tarefa.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("entregas").upload(caminho, arquivo, { upsert: true });
    if (error) {
      setErro("Não foi possível enviar o áudio. Tente de novo.");
      return;
    }
    setTemAudio(true);
    marcar(true, { arquivoPath: caminho });
  }

  return (
    <div
      className={`rounded-[14px] border border-[var(--border)] bg-[var(--surface)] ${
        compacta ? "" : ""
      }`}
    >
      <button
        type="button"
        onClick={clicarCaixa}
        disabled={isPending}
        aria-pressed={feita}
        className="w-full min-h-[60px] flex items-center gap-3.5 px-3.5 py-3 text-left"
      >
        <span
          className={`w-6 h-6 shrink-0 rounded-[7px] flex items-center justify-center ${
            feita
              ? "bg-[var(--gold)] border border-[var(--gold)]"
              : "bg-[var(--surface)] border-[1.5px] border-[#8f96a3]"
          }`}
        >
          {feita && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0e1b33" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5L20 7" />
            </svg>
          )}
        </span>
        <span className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span
            className={`text-[15px] font-medium ${
              feita ? "line-through text-[var(--text-secondary)]" : "text-[var(--text-primary)]"
            }`}
          >
            {tarefa.texto}
          </span>
          {(meta || (!simples && !feita)) && (
            <span className="text-xs text-[var(--text-secondary)]">
              {[meta, !simples && !feita ? AJUDA[tarefa.entrega] : null].filter(Boolean).join(" · ")}
            </span>
          )}
        </span>
      </button>

      {aberta && !feita && (
        <div className="px-3.5 pb-4 space-y-3 border-t border-[var(--border-soft)] pt-3">
          {tarefa.entrega === "texto" && (
            <>
              <label className="sr-only" htmlFor={`resp-${tarefa.id}`}>
                Sua resposta
              </label>
              <textarea
                id={`resp-${tarefa.id}`}
                rows={4}
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Escreva aqui"
                className="w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-3 text-[15px]"
              />
              <button
                type="button"
                disabled={isPending || !resposta.trim()}
                onClick={() => marcar(true, { resposta: resposta.trim() })}
                className="h-11 px-5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-semibold disabled:opacity-50"
              >
                Enviar resposta
              </button>
            </>
          )}

          {tarefa.entrega === "audio" && (
            <>
              <input
                ref={arquivoRef}
                type="file"
                accept="audio/*"
                capture
                className="sr-only"
                aria-label="Gravar ou escolher um áudio"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) enviarAudio(f);
                }}
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() => arquivoRef.current?.click()}
                className="h-11 px-5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-semibold disabled:opacity-50"
              >
                {temAudio ? "Enviar outro áudio" : "Gravar ou enviar áudio"}
              </button>
            </>
          )}

          {tarefa.entrega === "link" && (
            <div className="flex flex-wrap gap-2">
              {tarefa.linkUrl && (
                <a
                  href={tarefa.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 px-5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-semibold flex items-center"
                >
                  Abrir atividade ↗
                </a>
              )}
              <button
                type="button"
                disabled={isPending}
                onClick={() => marcar(true)}
                className="h-11 px-5 rounded-xl border border-[var(--accent)] text-[var(--text-primary)] text-sm font-semibold"
              >
                Já fiz, marcar como feita
              </button>
            </div>
          )}
        </div>
      )}

      {feita && tarefa.comentario && (
        <p className="px-3.5 pb-3 text-[13px] text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--gold-text)]">Professora:</span> {tarefa.comentario}
        </p>
      )}

      {erro && (
        <p role="alert" className="px-3.5 pb-3 text-sm text-[var(--danger-text)]">
          {erro}
        </p>
      )}
    </div>
  );
}
