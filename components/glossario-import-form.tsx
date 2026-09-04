"use client";

import { useState, useTransition } from "react";
import { importarTermos } from "@/app/(admin)/admin/glossario/actions";

type Linha = { termo: string; definicao: string; exemplo: string };

function limparPrefixo(linha: string) {
  return linha.replace(/^\s*(?:\d+[.)]|[-•*])\s+/, "");
}

function dividirLinha(linhaOriginal: string): Linha {
  const linha = limparPrefixo(linhaOriginal.trim());

  if (linha.includes("\t")) {
    const [termo = "", definicao = "", exemplo = ""] = linha.split("\t").map((c) => c.trim());
    return { termo, definicao, exemplo };
  }

  const separadores = [" — ", " – ", " - ", ": ", " | "];
  for (const sep of separadores) {
    const idx = linha.indexOf(sep);
    if (idx > 0) {
      return {
        termo: linha.slice(0, idx).trim(),
        definicao: linha.slice(idx + sep.length).trim(),
        exemplo: "",
      };
    }
  }

  return { termo: linha, definicao: "", exemplo: "" };
}

function parseTexto(texto: string): Linha[] {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map(dividirLinha);
}

export default function GlossarioImportForm({ categorias }: { categorias: string[] }) {
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function gerarTabela() {
    setError(null);
    setSaved(null);
    setLinhas(parseTexto(texto));
  }

  function atualizarLinha(index: number, campo: keyof Linha, valor: string) {
    setLinhas((prev) => {
      if (!prev) return prev;
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  }

  function removerLinha(index: number) {
    setLinhas((prev) => (prev ? prev.filter((_, i) => i !== index) : prev));
  }

  function adicionarLinha() {
    setLinhas((prev) => [...(prev ?? []), { termo: "", definicao: "", exemplo: "" }]);
  }

  function handleImportar() {
    if (!linhas) return;
    const validas = linhas.filter((l) => l.termo.trim() && l.definicao.trim());
    setError(null);
    startTransition(async () => {
      const result = await importarTermos(
        validas.map((l) => ({ termo: l.termo, definicao: l.definicao, exemplo: l.exemplo || null })),
        categoria.trim() || null
      );
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(result?.total ?? validas.length);
        setTexto("");
        setLinhas(null);
        setCategoria("");
        setTimeout(() => setSaved(null), 3000);
      }
    });
  }

  const linhasValidas = (linhas ?? []).filter((l) => l.termo.trim() && l.definicao.trim()).length;

  return (
    <div className="space-y-3 border border-[var(--border)] rounded-lg p-4">
      <p className="text-xs text-[var(--text-secondary)]">
        Cole qualquer lista — uma tabela do Excel/Google Sheets, ou linhas soltas tipo &quot;Termo -
        Definição&quot; ou &quot;Termo: Definição&quot; — e clique em <strong>Gerar tabela</strong>. Depois é
        só revisar e ajustar antes de importar.
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
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={5}
        placeholder={"Cole aqui sua lista...\nex: Ojalá - Tomara, espero que"}
        className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm font-mono"
      />

      <button
        type="button"
        onClick={gerarTabela}
        disabled={!texto.trim()}
        className="rounded-md border border-[var(--border-strong)] text-sm font-medium px-4 py-2 hover:bg-[var(--surface-3)] disabled:opacity-50"
      >
        Gerar tabela
      </button>

      {linhas && (
        <div className="space-y-2 border-t border-[var(--border-soft)] pt-3">
          {linhas.length === 0 ? (
            <p className="text-xs text-[var(--text-faint)]">Nenhuma linha encontrada no texto colado.</p>
          ) : (
            <>
              <p className="text-xs text-[var(--text-faint)]">
                {linhasValidas} de {linhas.length} linha(s) prontas (termo e definição preenchidos). Ajuste o
                que precisar antes de importar — os campos com borda vermelha ainda estão incompletos.
              </p>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {linhas.map((linha, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-1.5 items-start">
                    <input
                      type="text"
                      value={linha.termo}
                      onChange={(e) => atualizarLinha(i, "termo", e.target.value)}
                      placeholder="Termo"
                      className={`bg-[var(--surface)] rounded-md border px-2 py-1.5 text-xs ${
                        linha.termo.trim() ? "border-[var(--border-strong)]" : "border-[var(--danger-text)]"
                      }`}
                    />
                    <input
                      type="text"
                      value={linha.definicao}
                      onChange={(e) => atualizarLinha(i, "definicao", e.target.value)}
                      placeholder="Definição"
                      className={`bg-[var(--surface)] rounded-md border px-2 py-1.5 text-xs ${
                        linha.definicao.trim() ? "border-[var(--border-strong)]" : "border-[var(--danger-text)]"
                      }`}
                    />
                    <input
                      type="text"
                      value={linha.exemplo}
                      onChange={(e) => atualizarLinha(i, "exemplo", e.target.value)}
                      placeholder="Exemplo (opcional)"
                      className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-2 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removerLinha(i)}
                      aria-label="Remover linha"
                      className="text-[var(--text-faint)] hover:text-[var(--danger-text)] px-1.5 py-1.5 justify-self-start sm:justify-self-auto"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          <button
            type="button"
            onClick={adicionarLinha}
            className="text-xs text-[var(--text-secondary)] hover:underline"
          >
            + Adicionar linha
          </button>
        </div>
      )}

      {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}

      {linhas && linhas.length > 0 && (
        <button
          type="button"
          onClick={handleImportar}
          disabled={isPending || linhasValidas === 0}
          className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 disabled:opacity-50 btn-glow"
        >
          {isPending
            ? "Importando..."
            : saved !== null
              ? `✓ ${saved} termo(s) importado(s)!`
              : `Importar ${linhasValidas} termo(s)`}
        </button>
      )}
    </div>
  );
}
