"use client";

import { useRef, useState, useTransition } from "react";
import CampoIdioma from "./campo-idioma";
import { createMaterial } from "@/app/(admin)/admin/(gestao)/materias/[id]/actions";
import LiberacaoFields from "./liberacao-fields";

const TIPOS = [
  { value: "html", label: "Página HTML interativa" },
  { value: "pdf", label: "PDF" },
  { value: "video", label: "Vídeo" },
  { value: "playlist", label: "Playlist de música" },
  { value: "podcast", label: "Podcast" },
  { value: "link_externo", label: "Link externo" },
  { value: "missao", label: "Missão (o aluno entrega áudio ou texto)" },
];

type Props = {
  materiaId: string;
  turmas: { id: string; nome: string }[];
  alunos: { id: string; nome: string | null; email: string }[];
  fases: { id: string; titulo: string }[];
  turmasPadrao?: string[]; // programas que já têm este módulo: vêm marcados
  idiomaPadrao?: string;
};

export default function MaterialForm({ materiaId, turmas, alunos, fases, turmasPadrao = [], idiomaPadrao }: Props) {
  const [tipo, setTipo] = useState("html");
  const [htmlPreview, setHtmlPreview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [liberacaoKey, setLiberacaoKey] = useState(0);
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
        setLiberacaoKey((k) => k + 1);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3 border border-[var(--border)] rounded-[18px] bg-[var(--surface)] p-5">
      <input type="hidden" name="materia_id" value={materiaId} />
      <CampoIdioma key={`idioma-${liberacaoKey}`} rotulo="Este conteúdo é de qual idioma?" defaultValue={idiomaPadrao} />

      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          name="titulo"
          required
          placeholder="Título da aula (ex.: Vídeo: como abrir uma reunião)"
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
          <option value="">Sem etapa</option>
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
              <iframe sandbox="allow-scripts" srcDoc={htmlPreview} className="w-full h-full min-h-[200px]" title="Pré-visualização" />
            ) : (
              <p className="text-xs text-[var(--text-faint)] p-3">A pré-visualização aparece aqui.</p>
            )}
          </div>
        </div>
      )}

      {tipo === "missao" && <CamposMissao />}

      {tipo === "pdf" && <input type="file" name="arquivo" accept="application/pdf" required className="bg-[var(--surface)] text-sm" />}

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

      <LiberacaoFields key={liberacaoKey} turmas={turmas} alunos={alunos} turmaIdsLiberadas={turmasPadrao} />

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

export function CamposMissao({ enunciado = "", entrega = "audio_texto" }: { enunciado?: string; entrega?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <textarea
        name="enunciado"
        required
        rows={6}
        defaultValue={enunciado}
        placeholder={"O que o aluno deve fazer. Separe parágrafos com uma linha em branco.\n\nVersão profissional: comece um parágrafo assim para ele aparecer em destaque."}
        className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
      />
      <label className="text-xs text-[var(--text-secondary)] flex flex-wrap items-center gap-2">
        O aluno entrega:
        <select name="entrega" defaultValue={entrega} className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-2 py-1 text-sm">
          <option value="audio_texto">Áudio (e texto opcional)</option>
          <option value="audio">Só áudio</option>
          <option value="texto">Só texto</option>
          <option value="feito">Só marcar que fez (sem correção)</option>
        </select>
      </label>
    </div>
  );
}
