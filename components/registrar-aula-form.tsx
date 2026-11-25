"use client";

import { useRef, useState, useTransition } from "react";
import { registrarAula } from "@/app/(admin)/admin/alunos/[id]/actions";

const ENTREGAS = [
  { valor: "feito", label: "Só marcar como feita", ajuda: "O aluno marca a caixinha quando terminar." },
  { valor: "texto", label: "Texto", ajuda: "O aluno escreve a resposta na própria tarefa." },
  { valor: "audio", label: "Áudio", ajuda: "O aluno grava pelo celular e você ouve aqui na ficha." },
  { valor: "link", label: "Link externo", ajuda: "Um botão leva à UZUS, a um Google Docs ou formulário." },
];

const campo =
  "h-[46px] rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[15px] font-normal";

type Props = {
  alunoId: string;
  primeiroNome: string;
  aulaHoje: { id: string; tema: string } | null;
  idioma: string | null;
  dupla?: string | null;
};

export default function RegistrarAulaForm({ alunoId, primeiroNome, aulaHoje, idioma, dupla }: Props) {
  const [entrega, setEntrega] = useState("feito");
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function enviar(formData: FormData) {
    setMsg(null);
    formData.set("entrega", entrega);
    if (dupla && !formData.get("tarefa_dupla")) formData.set("tarefa_dupla", "0");
    startTransition(async () => {
      const r = await registrarAula(formData);
      if (r?.error) setMsg({ ok: false, texto: r.error });
      else {
        formRef.current?.reset();
        setEntrega("feito");
        setMsg({ ok: true, texto: `Salvo. ${primeiroNome} já vê no Plano.` });
      }
    });
  }

  const ajuda = ENTREGAS.find((e) => e.valor === entrega)?.ajuda;

  return (
    <form ref={formRef} action={enviar} className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-[22px] flex flex-col gap-4">
      <h2 className="m-0 font-serif font-semibold text-[26px]">Registrar a aula de hoje</h2>
      <p className="m-0 text-sm text-[var(--text-secondary)]">
        Dois campos e pronto. {primeiroNome} vê o resumo e a tarefa no Plano.
      </p>
      <input type="hidden" name="aluno_id" value={alunoId} />
      {idioma && <input type="hidden" name="idioma" value={idioma} />}
      {aulaHoje && <input type="hidden" name="aula_id" value={aulaHoje.id} />}
      <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
        Tema
        <input name="tema" required defaultValue={aulaHoje?.tema ?? ""} className={campo} />
      </label>
      <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
        O que trabalhamos
        <textarea
          name="resumo"
          rows={3}
          placeholder="Resumo curto da aula e vocabulário que apareceu"
          className="rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-3 text-[15px] font-normal resize-y"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
        Tarefa para a próxima aula
        <input name="tarefa" placeholder="Ex.: fechar a weekly de segunda com as decisões em espanhol" className={campo} />
      </label>
      {dupla && (
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" name="tarefa_dupla" value="1" defaultChecked className="w-[18px] h-[18px]" />
          Tarefa também para {dupla} (a aula é registrada para as duas)
        </label>
      )}
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold">Como o aluno entrega</span>
        <div className="flex gap-2 flex-wrap">
          {ENTREGAS.map((e) => (
            <button
              key={e.valor}
              type="button"
              onClick={() => setEntrega(e.valor)}
              aria-pressed={entrega === e.valor}
              className={`h-[38px] px-3.5 rounded-full text-[13px] font-medium border ${
                entrega === e.valor
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]"
                  : "bg-[var(--surface)] border-[var(--border-strong)]"
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
        <p className="m-0 text-[13px] text-[var(--text-secondary)]">{ajuda}</p>
        {entrega === "link" && (
          <input name="link_url" type="url" placeholder="https://..." aria-label="Link da atividade" className={campo} />
        )}
        <label className="flex items-center gap-2 text-[13px] font-semibold">
          Prazo (opcional)
          <input name="prazo" type="date" className="h-10 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm font-normal" />
        </label>
      </div>
      <div className="flex items-center gap-3.5 flex-wrap">
        <button
          type="submit"
          disabled={isPending}
          className="h-[46px] px-[22px] rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-[15px] disabled:opacity-60"
        >
          {isPending ? "Salvando..." : "Salvar aula"}
        </button>
        {msg && (
          <span role="status" className={`text-sm font-semibold ${msg.ok ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}`}>
            {msg.texto}
          </span>
        )}
      </div>
    </form>
  );
}
