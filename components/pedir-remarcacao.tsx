"use client";

import { useActionState } from "react";
import { pedirRemarcacao } from "@/app/remarcacao-actions";

const campo = "rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-3 text-[15px] font-normal";

// O aluno pede para remarcar uma aula individual. A professora recebe por e-mail e vê na ficha.
export default function PedirRemarcacao({
  aulaId,
  professora,
  enviadoEm,
  demonstracao,
}: {
  aulaId: string;
  professora: string;
  enviadoEm: string | null;
  demonstracao?: boolean;
}) {
  const [estado, enviar, pendente] = useActionState(pedirRemarcacao, null);

  if (enviadoEm || estado?.ok) {
    return (
      <p className="m-0 text-[15px]">
        Pedido enviado{enviadoEm ? ` ${enviadoEm}` : ""}. {professora} vai responder com a nova data, e você recebe um e-mail quando a aula
        mudar.
      </p>
    );
  }

  return (
    <form action={enviar} className="flex flex-col gap-3">
      <input type="hidden" name="aula_id" value={aulaId} />
      <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
        Que dias e horários funcionam para você?
        <input name="sugestao" required placeholder="Ex.: quinta às 18h ou sexta de manhã" className={campo} />
      </label>
      <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
        Quer deixar um recado? (opcional)
        <textarea name="mensagem" rows={2} className={campo} />
      </label>
      {estado?.error && <p className="m-0 text-sm text-[var(--danger-text)]">{estado.error}</p>}
      <button
        type="submit"
        disabled={pendente || demonstracao}
        className="self-start h-[46px] px-5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-[15px] disabled:opacity-60"
      >
        {pendente ? "Enviando..." : "Enviar pedido"}
      </button>
      {demonstracao && <p className="m-0 text-xs text-[var(--text-secondary)]">Na visualização da equipe o envio fica desligado.</p>}
    </form>
  );
}
