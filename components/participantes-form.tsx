"use client";

import { useState, useTransition } from "react";
import { adicionarParticipantes, type ResultadoParticipante } from "@/app/(admin)/admin/(gestao)/empresas/actions";

// Adiciona várias pessoas de uma vez a um grupo da empresa.
// Uma por linha: "Nome, e-mail" (a lista que o RH manda geralmente já vem assim).
export default function ParticipantesForm({ empresaId, turmaId }: { empresaId: string; turmaId: string }) {
  const [texto, setTexto] = useState("");
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultados, setResultados] = useState<ResultadoParticipante[]>([]);
  const [copiado, setCopiado] = useState(false);
  const [boasVindas, setBoasVindas] = useState(false);
  const [isPending, startTransition] = useTransition();

  function enviar() {
    setErro(null);
    setResultados([]);
    startTransition(async () => {
      const r = await adicionarParticipantes(empresaId, turmaId, texto, boasVindas);
      if (r.error) setErro(r.error);
      else {
        setResultados(r.resultados);
        setTexto("");
      }
    });
  }

  const novos = resultados.filter((r) => r.senha);
  const mensagem = novos
    .map((r) => `${r.nome ?? r.email}\nE-mail: ${r.email}\nSenha: ${r.senha}`)
    .join("\n\n");

  if (!aberto && !resultados.length) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="self-start h-10 px-3.5 rounded-xl border border-[var(--border-strong)] text-sm font-medium hover:bg-[var(--surface-2)]"
      >
        + Adicionar participantes
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {resultados.length > 0 && (
        <div className="rounded-xl bg-[var(--success-bg)] p-3.5 flex flex-col gap-2 text-sm">
          <span className="font-semibold text-[var(--success-text)]">
            {novos.length
              ? `${novos.length} ${novos.length === 1 ? "acesso criado" : "acessos criados"}. ${
                  boasVindas ? "Cada pessoa recebe os dados por e-mail em alguns minutos. Se quiser, copie também:" : "Envie os dados para o RH ou para cada pessoa:"
                }`
              : "Pronto."}
          </span>
          <ul className="m-0 p-0 list-none flex flex-col gap-1">
            {resultados.map((r) => (
              <li key={r.email} className="font-mono text-[13px]">
                {r.nome ? `${r.nome} · ` : ""}
                {r.email}
                {r.senha ? ` · senha ${r.senha}` : r.erro ? ` · ${r.erro}` : " · já tinha conta (senha mantida)"}
              </li>
            ))}
          </ul>
          {novos.length > 0 && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(mensagem);
                setCopiado(true);
              }}
              className="self-start h-9 px-3 rounded-lg border border-[var(--success-text)]/40 text-[13px] font-semibold"
            >
              {copiado ? "✓ Copiado" : "Copiar acessos"}
            </button>
          )}
        </div>
      )}
      <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
        Uma pessoa por linha: Nome, e-mail
        <textarea
          rows={4}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={"Mariana Souza, mariana@empresa.com\nJoão Lima, joao@empresa.com"}
          className="rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2.5 text-sm font-normal font-mono"
        />
      </label>
      <label className="flex items-center gap-2.5 text-sm">
        <input type="checkbox" checked={boasVindas} onChange={(e) => setBoasVindas(e.target.checked)} className="w-[18px] h-[18px] accent-[var(--navy)]" />
        Liberar o acesso agora (boas-vindas com login e senha, e avisos ligados). Sem marcar, ficam “em montagem”.
      </label>
      {erro && <p role="alert" className="m-0 text-sm text-[var(--danger-text)]">{erro}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending || !texto.trim()}
          onClick={enviar}
          className="h-10 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-semibold disabled:opacity-50"
        >
          {isPending ? "Criando acessos..." : "Adicionar ao grupo"}
        </button>
        <button type="button" onClick={() => { setAberto(false); setResultados([]); }} className="h-10 px-3 text-sm text-[var(--text-secondary)]">
          Fechar
        </button>
      </div>
    </div>
  );
}
