"use client";

import { useRef, useState, useTransition } from "react";
import { updateMaterial } from "@/app/(admin)/admin/materias/[id]/actions";
import LiberacaoFields from "./liberacao-fields";

const TIPO_LABELS: Record<string, string> = {
  html: "Página HTML",
  pdf: "PDF",
  video: "Vídeo",
  playlist: "Playlist",
  podcast: "Podcast",
  link_externo: "Link externo",
};

type Material = {
  id: string;
  titulo: string;
  tipo: string;
  conteudo_html: string | null;
  url: string | null;
  fase_id: string | null;
  visivel_todos: boolean;
};

type Props = {
  material: Material;
  materiaId: string;
  acessos: string[];
  fases: { id: string; titulo: string }[];
  turmas: { id: string; nome: string }[];
  alunos: { id: string; nome: string | null; email: string }[];
  turmaIdsLiberadas: string[];
  alunoIdsLiberados: string[];
  deleteAction: (formData: FormData) => void;
  moverAction: (id: string, materiaId: string, faseId: string | null, direcao: "up" | "down") => Promise<void>;
  moverParaFaseAction: (id: string, materiaId: string, faseId: string | null) => Promise<void>;
  isFirst: boolean;
  isLast: boolean;
};

export default function MaterialRow({
  material,
  materiaId,
  acessos,
  fases,
  turmas,
  alunos,
  turmaIdsLiberadas,
  alunoIdsLiberados,
  deleteAction,
  moverAction,
  moverParaFaseAction,
  isFirst,
  isLast,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState(material.conteudo_html ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isMoving, startMoveTransition] = useTransition();
  const [isMovingFase, startMoveFaseTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateMaterial(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setEditing(false);
      }
    });
  }

  function mover(direcao: "up" | "down") {
    startMoveTransition(async () => {
      await moverAction(material.id, materiaId, material.fase_id, direcao);
    });
  }

  function moverParaFase(faseId: string) {
    startMoveFaseTransition(async () => {
      await moverParaFaseAction(material.id, materiaId, faseId || null);
    });
  }

  return (
    <li className="p-3 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex flex-col shrink-0">
            <button
              type="button"
              onClick={() => mover("up")}
              disabled={isFirst || isMoving}
              aria-label="Mover para cima"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-25 disabled:cursor-not-allowed leading-none px-1 py-0.5"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => mover("down")}
              disabled={isLast || isMoving}
              aria-label="Mover para baixo"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-25 disabled:cursor-not-allowed leading-none px-1 py-0.5"
            >
              ▼
            </button>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">{material.titulo}</p>
            <p className="text-xs text-[var(--text-secondary)]">
              {TIPO_LABELS[material.tipo] ?? material.tipo}
              {acessos.length > 0 ? ` · ${acessos.join(", ")}` : " · ninguém tem acesso ainda"}
            </p>
            {fases.length > 0 && (
              <select
                key={material.fase_id ?? "sem-fase"}
                defaultValue={material.fase_id ?? ""}
                onChange={(e) => moverParaFase(e.target.value)}
                disabled={isMovingFase}
                className="mt-1 text-xs bg-[var(--surface)] border border-[var(--border-strong)] rounded px-1.5 py-0.5 disabled:opacity-50"
              >
                <option value="">Sem módulo</option>
                {fases.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.titulo}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="text-[var(--text-secondary)] hover:underline"
          >
            {editing ? "Cancelar" : "Editar"}
          </button>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={material.id} />
            <input type="hidden" name="materia_id" value={materiaId} />
            <button type="submit" className="text-[var(--text-faint)] hover:text-[var(--danger-text)]">
              Excluir
            </button>
          </form>
        </div>
      </div>

      {editing && (
        <form
          ref={formRef}
          action={handleSubmit}
          className="space-y-3 border-t border-[var(--border-soft)] pt-3"
        >
          <input type="hidden" name="id" value={material.id} />
          <input type="hidden" name="materia_id" value={materiaId} />
          <input type="hidden" name="tipo" value={material.tipo} />

          <input
            type="text"
            name="titulo"
            defaultValue={material.titulo}
            required
            className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
          />

          {material.tipo === "html" && (
            <div className="grid sm:grid-cols-2 gap-3">
              <textarea
                name="conteudo_html"
                required
                rows={8}
                defaultValue={material.conteudo_html ?? ""}
                onChange={(e) => setHtmlPreview(e.target.value)}
                className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-3 py-2 text-xs font-mono"
              />
              <div className="rounded-md border border-[var(--border-strong)] overflow-hidden">
                <iframe
                  sandbox="allow-scripts"
                  srcDoc={htmlPreview}
                  className="w-full h-full min-h-[160px]"
                  title="Pré-visualização"
                />
              </div>
            </div>
          )}

          {material.tipo === "pdf" && (
            <div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">
                Substituir arquivo (opcional — deixe em branco pra manter o atual)
              </label>
              <input type="file" name="arquivo" accept="application/pdf" className="bg-[var(--surface)] text-sm" />
            </div>
          )}

          {(material.tipo === "video" ||
            material.tipo === "playlist" ||
            material.tipo === "podcast" ||
            material.tipo === "link_externo") && (
            <input
              type="url"
              name="url"
              defaultValue={material.url ?? ""}
              required
              className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
            />
          )}

          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-1">
              Trocar capa (opcional — deixe em branco pra manter a atual)
            </label>
            <input type="file" name="capa" accept="image/*" className="bg-[var(--surface)] text-sm" />
          </div>

          <LiberacaoFields
            turmas={turmas}
            alunos={alunos}
            turmaIdsLiberadas={turmaIdsLiberadas}
            alunoIdsLiberados={alunoIdsLiberados}
            todosInicial={material.visivel_todos}
          />

          {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 disabled:opacity-50 btn-glow"
          >
            {isPending ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      )}
    </li>
  );
}
