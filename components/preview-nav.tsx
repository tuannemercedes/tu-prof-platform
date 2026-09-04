import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getClubeAcessoParaAluno } from "@/lib/clube";
import { getMateriaisParaAluno } from "@/lib/materiais";
import { getGlossarioAcessoParaAluno } from "@/lib/glossario";

export default async function PreviewNav({ alunoId }: { alunoId: string }) {
  const supabase = await createClient();
  const [{ data: aluno }, materiaisAcessiveis, temClube, temGlossario] = await Promise.all([
    supabase.from("profiles").select("id, nome, email").eq("id", alunoId).single(),
    getMateriaisParaAluno(supabase, alunoId),
    getClubeAcessoParaAluno(supabase, alunoId),
    getGlossarioAcessoParaAluno(supabase, alunoId),
  ]);

  if (!aluno) return null;

  const materiasMap = new Map<string, { id: string; titulo: string; categoria: string }>();
  materiaisAcessiveis.forEach((row) => {
    if (!row.materias) return;
    materiasMap.set(row.materias.id, row.materias);
  });

  const todas = [...materiasMap.values()];
  const trilhas = todas.filter((m) => m.categoria !== "fia");
  const fia = todas.filter((m) => m.categoria === "fia");
  const base = `/admin/alunos/${alunoId}/preview`;

  const linkStyle =
    "text-xs rounded-md border border-[var(--border-strong)] px-2.5 py-1 hover:bg-[var(--surface-2)] whitespace-nowrap";

  return (
    <div className="mb-6 border border-[var(--border)] rounded-lg p-3 space-y-2 bg-[var(--surface-2)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-sm font-medium">Visualizando: {aluno.nome || aluno.email}</span>{" "}
          <span className="text-xs bg-[var(--warning-bg)] text-[var(--warning-text)] px-2 py-0.5 rounded">
            Somente leitura
          </span>
        </div>
        <Link href="/admin/alunos" className="text-xs text-[var(--text-secondary)] hover:underline whitespace-nowrap">
          ← Voltar pra Alunos
        </Link>
      </div>
      <nav className="flex flex-wrap gap-2">
        <Link href={base} className={linkStyle}>
          Início
        </Link>
        <Link href={`${base}/cronograma`} className={linkStyle}>
          Cronograma
        </Link>
        <Link href={`${base}/planner`} className={linkStyle}>
          Planner
        </Link>
        <Link href={`${base}/calendario`} className={linkStyle}>
          Calendário
        </Link>
        {temClube && (
          <Link href={`${base}/clube`} className={linkStyle}>
            Clube de Conversação
          </Link>
        )}
        {temGlossario && (
          <Link href={`${base}/glossario`} className={linkStyle}>
            Glossário
          </Link>
        )}
        {trilhas.map((t) => (
          <Link key={t.id} href={`${base}/materias/${t.id}`} className={linkStyle}>
            {t.titulo}
          </Link>
        ))}
        {fia.map((t) => (
          <Link key={t.id} href={`${base}/materias/${t.id}`} className={linkStyle}>
            {t.titulo} (FIA)
          </Link>
        ))}
      </nav>
    </div>
  );
}
