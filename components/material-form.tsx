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
};

export default function MaterialForm({ materiaId, turmas }: Props) {
  const [tipo, setTipo] = useState("html");
  const [htmlPreview, setHtmlPreview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createMaterial(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        setHtmlPreview("");
        setTipo("html");
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-3 border border-gray-200 rounded-lg p-4"
    >
      <input type="hidden" name="materia_id" value={materiaId} />

      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          name="titulo"
          required
          placeholder="Título do material"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {tipo === "html" && (
        <div className="grid sm:grid-cols-2 gap-3">
          <textarea
            name="conteudo_html"
            required
            rows={10}
            placeholder="Cole aqui o código HTML gerado no ChatGPT/Claude"
            className="rounded-md border border-gray-300 px-3 py-2 text-xs font-mono"
            onChange={(e) => setHtmlPreview(e.target.value)}
          />
          <div className="rounded-md border border-gray-300 overflow-hidden">
            {htmlPreview ? (
              <iframe
                sandbox="allow-scripts"
                srcDoc={htmlPreview}
                className="w-full h-full min-h-[200px]"
                title="Pré-visualização"
              />
            ) : (
              <p className="text-xs text-gray-400 p-3">A pré-visualização aparece aqui.</p>
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
          className="text-sm"
        />
      )}

      {(tipo === "video" || tipo === "playlist" || tipo === "podcast" || tipo === "link_externo") && (
        <input
          type="url"
          name="url"
          required
          placeholder="https://..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      )}

      {turmas.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Liberar para quais turmas?</p>
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-black text-white text-sm font-medium px-4 py-2 disabled:opacity-50"
      >
        {isPending ? "Salvando..." : "Adicionar material"}
      </button>
    </form>
  );
}
