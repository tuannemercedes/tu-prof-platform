"use client";

import { useMemo, useState, useTransition } from "react";
import CampoIdioma from "./campo-idioma";
import { importarTermos } from "@/app/(admin)/admin/(gestao)/glossario/actions";

type Linha = { termo: string; definicao: string; exemplo: string | null };

function limparPrefixo(linha: string) {
  return linha.replace(/^\s*(?:\d+[.)]|[-•*])\s+/, "");
}

function dividirLinha(linhaOriginal: string): Linha {
  const linha = limparPrefixo(linhaOriginal.trim());

  if (linha.includes("\t")) {
    const [termo = "", definicao = "", exemplo = ""] = linha.split("\t").map((c) => c.trim());
    return { termo, definicao, exemplo: exemplo || null };
  }

  const separadores = [" — ", " – ", " - ", ": ", " | "];
  for (const sep of separadores) {
    const idx = linha.indexOf(sep);
    if (idx > 0) {
      return { termo: linha.slice(0, idx).trim(), definicao: linha.slice(idx + sep.length).trim(), exemplo: null };
    }
  }

  return { termo: linha, definicao: "", exemplo: null };
}

function parseTexto(texto: string): Linha[] {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map(dividirLinha);
}

export default function GlossarioImportForm({
  categoria,
  alunoId,
  alunos,
}: {
  categoria: string | null;
  alunoId?: string;
  alunos?: { id: string; nome: string }[];
}) {
  const [texto, setTexto] = useState("");
  const [idioma, setIdioma] = useState("espanhol");
  const [para, setPara] = useState(alunoId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const linhas = useMemo(() => parseTexto(texto), [texto]);
  const validas = linhas.filter((l) => l.termo && l.definicao);
  const invalidas = linhas.length - validas.length;

  function handleImportar() {
    setError(null);
    setSaved(null);
    startTransition(async () => {
      const result = await importarTermos(validas, categoria, idioma, para || null);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(result?.total ?? validas.length);
        setTexto("");
        setTimeout(() => setSaved(null), 3000);
      }
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--text-secondary)]">
        Cole uma lista — tabela do Excel/Sheets, ou linhas soltas tipo &quot;Termo - Definição&quot; — uma
        por linha.
      </p>
      <CampoIdioma name="" rotulo="Idioma destes termos" value={idioma} onChange={setIdioma} />
      {!alunoId && alunos && alunos.length > 0 && (
        <label className="flex flex-wrap items-center gap-2.5 text-[13px] font-semibold">
          Para quem
          <select value={para} onChange={(e) => setPara(e.target.value)} className="h-9 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 text-sm font-normal">
            <option value="">Glossário geral</option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                Só para {a.nome}
              </option>
            ))}
          </select>
        </label>
      )}
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={4}
        placeholder={"Cole aqui...\nex: Ojalá - Tomara, espero que"}
        className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm font-mono"
      />

      {texto.trim() && (
        <p className="text-xs text-[var(--text-faint)]">
          {validas.length} termo(s) reconhecido(s)
          {invalidas > 0 ? ` · ${invalidas} linha(s) sem definição foram ignoradas` : ""}.
        </p>
      )}

      {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}

      <button
        type="button"
        onClick={handleImportar}
        disabled={isPending || validas.length === 0}
        className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 disabled:opacity-50 btn-glow"
      >
        {isPending
          ? "Importando..."
          : saved !== null
            ? `✓ ${saved} termo(s) importado(s)!`
            : `Importar ${validas.length} termo(s)`}
      </button>
    </div>
  );
}
