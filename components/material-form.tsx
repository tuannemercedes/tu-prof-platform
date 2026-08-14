"use client";

import { useRef, useState, useTransition } from "react";
import { createMaterial } from "@/app/(admin)/admin/materias/[id]/actions";

const TIPOS = [
  { value: "html", label: "Página HTML interativa" },
  { value: "pdf", label: "PDF" },
  { value: "video", label: "Vídeo" },
  { value: "playlist", label: "Playlist de música" },
  { value: "podcast", label: "Podcast" },
  { value: "link_externo", label: "Link externo" },
];

type Props = {
  materiaId: string;
  turmas: { id: string; nome: string }[];
  alunos: { id: string; nome: string | null; email: string }[];
  fases: { id: string; titulo: string }[];
};

export default function MaterialForm({ materiaId, turmas, alunos, fases }: Props) {
  const [tipo, setTipo] = useState("html");
  const [htmlPreview, setHtmlPreview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await createMaterial(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        setHtmlPreview("");
        setTipo("html");
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-3 border border-[var(--border)] rounded-lg p-4"
    >
      <input type="hidden" name="materia_id" value={materiaId} />

      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          name="titulo"
          required
          placeholder="Título do material (aula)"
          className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {fases.length > 0 && (
        <select
          name="fase_id"
          defaultValue=""
          className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        >
          <option value="">Sem fase (fica direto na trilha)</option>
          {fases.map((f) => (
            <option key={f.id} value={f.id}>
              {f.titulo}
            </option>
          ))}
        </select>
      )}

      {tipo === "html" && (
        <div className="grid sm:grid-cols-2 gap-3">
          <textarea
            name="conteudo_html"
            required
            rows={10}
            placeholder="Cole aqui o código HTML gerado no ChatGPT/Claude"
            className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-3 py-2 text-xs font-mono"
            onChange={(e) => setHtmlPreview(e.target.value)}
          />
          <div className="rounded-md border border-[var(--border-strong)] overflow-hidden">
            {htmlPreview ? (
              <iframe
                sandbox="allow-scripts"
                srcDoc={htmlPreview}
                className="w-full h-full min-h-[200px]"
                title="Pré-visualização"
              />
            ) : (
              <p className="text-xs text-[var(--text-faint)] p-3">A pré-visualização aparece aqui.</p>
            )}
          </div>
        </div>
      )}

      {tipo === "pdf" && (
        <input
          type="file"
          name="arquivo"
          accept="application/pdf"
          required
          className="bg-[var(--surface)] text-sm"
        />
      )}

      <div>
        <label className="text-xs text-[var(--text-secondary)] block mb-1">
          Capa (opcional) — aparece no card do aluno. Sem capa, mostramos um ícone do tipo.
        </label>
        <input type="file" name="capa" accept="image/*" className="bg-[var(--surface)] text-sm" />
      </div>

      {(tipo === "video" || tipo === "playlist" || tipo === "podcast" || tipo === "link_externo") && (
        <input
          type="url"
          name="url"
          required
          placeholder="https://..."
          className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
      )}

      {turmas.length > 0 && (
        <div>
          <p className="text-xs text-[var(--text-secondary)] mb-1">Liberar para quais turmas?</p>
          <div className="flex flex-wrap gap-3 text-sm">
            {turmas.map((turma) => (
              <label key={turma.id} className="flex items-center gap-1.5">
                <input type="checkbox" name="turmas" value={turma.id} />
                {turma.nome}
              </label>
            ))}
          </div>
        </div>
      )}

      {alunos.length > 0 && (
        <div>
          <p className="text-xs text-[var(--text-secondary)] mb-1">
            Liberar para alunos específicos (opcional, além das turmas acima)
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            {alunos.map((aluno) => (
              <label key={aluno.id} className="flex items-center gap-1.5">
                <input type="checkbox" name="alunos" value={aluno.id} />
                {aluno.nome || aluno.email}
              </label>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 disabled:opacity-50 btn-glow"
      >
        {isPending ? "Salvando..." : saved ? "✓ Material adicionado!" : "Adicionar material"}
      </button>
    </form>
  );
}
