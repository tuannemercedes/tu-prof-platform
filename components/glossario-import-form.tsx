"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { importarTermos } from "@/app/(admin)/admin/glossario/actions";

function parseTabela(texto: string) {
  return texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean)
    .map((linha) => {
      const [termo, definicao, exemplo] = linha.split("\t").map((c) => c?.trim() ?? "");
      return { termo: termo ?? "", definicao: definicao ?? "", exemplo: exemplo || null };
    })
    .filter((l) => l.termo && l.definicao);
}

export default function GlossarioImportForm({ categorias }: { categorias: string[] }) {
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const linhas = useMemo(() => parseTabela(texto), [texto]);

  function handleImportar() {
    setError(null);
    setSaved(null);
    startTransition(async () => {
      const result = await importarTermos(linhas, categoria.trim() || null);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(result?.total ?? linhas.length);
        setTexto("");
        setCategoria("");
        textareaRef.current?.focus();
        setTimeout(() => setSaved(null), 3000);
      }
    });
  }

  return (
    <div className="space-y-3 border border-[var(--border)] rounded-lg p-4">
      <p className="text-xs text-[var(--text-secondary)]">
        Copie uma tabela do Excel/Google Sheets/Word com duas ou três colunas — <strong>termo</strong>,{" "}
        <strong>definição</strong> e opcionalmente <strong>exemplo</strong> — e cole abaixo. Cada linha vira um
        termo novo.
      </p>

      <input
        type="text"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        list="glossario-categorias"
        placeholder="Categoria pra todos esses termos (opcional, ex: UX)"
        className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
      />
      <datalist id="glossario-categorias">
        {categorias.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <textarea
        ref={textareaRef}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={6}
        placeholder={"Cole aqui a tabela copiada...\nex: Ojalá[tab]Tomara, espero que[tab]Ojalá llueva mañana."}
        className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm font-mono"
      />

      {texto.trim() && (
        <p className="text-xs text-[var(--text-faint)]">
          {linhas.length > 0
            ? `${linhas.length} termo(s) reconhecido(s) e prontos pra importar.`
            : "Nenhuma linha reconhecida ainda — confira se colou termo e definição separados por Tab."}
        </p>
      )}

      {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}

      <button
        type="button"
        onClick={handleImportar}
        disabled={isPending || linhas.length === 0}
        className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 disabled:opacity-50 btn-glow"
      >
        {isPending
          ? "Importando..."
          : saved !== null
            ? `✓ ${saved} termo(s) importado(s)!`
            : linhas.length > 0
              ? `Importar ${linhas.length} termo(s)`
              : "Importar"}
      </button>
    </div>
  );
}
