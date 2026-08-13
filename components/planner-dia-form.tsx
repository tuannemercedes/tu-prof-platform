"use client";

import { useRef, useState, useTransition } from "react";
import { createPlannerDia } from "@/app/(admin)/admin/alunos/[id]/planner/actions";

export default function PlannerDiaForm({ alunoId }: { alunoId: string }) {
  const [htmlPreview, setHtmlPreview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createPlannerDia(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        setHtmlPreview("");
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-3 border border-[var(--border)] rounded-lg p-4"
    >
      <input type="hidden" name="aluno_id" value={alunoId} />
      <div className="grid sm:grid-cols-[100px_1fr] gap-3">
        <input
          type="number"
          name="semana"
          min={1}
          defaultValue={1}
          placeholder="Semana"
          className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="titulo"
          required
          placeholder="Título do dia (ex: Dia 1)"
          className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <textarea
          name="conteudo_html"
          rows={8}
          placeholder="Conteúdo do dia (HTML opcional — texto, vídeo embutido, imagem)"
          className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-3 py-2 text-xs font-mono"
          onChange={(e) => setHtmlPreview(e.target.value)}
        />
        <div className="rounded-md border border-[var(--border-strong)] overflow-hidden">
          {htmlPreview ? (
            <iframe
              sandbox="allow-scripts"
              srcDoc={htmlPreview}
              className="w-full h-full min-h-[160px]"
              title="Pré-visualização"
            />
          ) : (
            <p className="text-xs text-[var(--text-faint)] p-3">A pré-visualização aparece aqui.</p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 disabled:opacity-50 btn-glow"
      >
        {isPending ? "Salvando..." : "Adicionar dia"}
      </button>
    </form>
  );
}
