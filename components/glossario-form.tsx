"use client";

import { useRef, useState, useTransition } from "react";
import CampoIdioma from "./campo-idioma";
import { saveTermo } from "@/app/(admin)/admin/(gestao)/glossario/actions";

type Props = {
  categoria: string | null;
  // Fixo: termo exclusivo deste aluno. Lista: deixa escolher entre geral e um aluno.
  alunoId?: string;
  alunos?: { id: string; nome: string }[];
};

export default function GlossarioForm({ categoria, alunoId, alunos }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveTermo(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-2">
      <input type="hidden" name="categoria" value={categoria ?? ""} />
      <CampoIdioma rotulo="Idioma do termo" />
      {alunoId ? (
        <input type="hidden" name="aluno_id" value={alunoId} />
      ) : alunos && alunos.length > 0 ? (
        <label className="flex flex-wrap items-center gap-2.5 text-[13px] font-semibold">
          Para quem
          <select name="aluno_id" defaultValue="" className="h-9 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 text-sm font-normal">
            <option value="">Glossário geral</option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                Só para {a.nome}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="grid sm:grid-cols-2 gap-2">
        <input
          type="text"
          name="termo"
          required
          placeholder="Termo ou expressão (ex: Ojalá)"
          className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="exemplo"
          placeholder="Exemplo de frase (opcional)"
          className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
      </div>
      <textarea
        name="definicao"
        required
        rows={2}
        placeholder="Definição / significado"
        className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
      />
      {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 disabled:opacity-50 btn-glow"
      >
        {isPending ? "Salvando..." : saved ? "✓ Termo adicionado!" : "Adicionar termo"}
      </button>
    </form>
  );
}
