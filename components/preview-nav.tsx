import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Row = {
  materia_id: string;
  materias: { id: string; titulo: string; categoria: string } | null;
  material_turmas: { turmas: { turma_membros: { aluno_id: string }[] } | null }[];
  material_alunos: { aluno_id: string }[];
};

export default async function PreviewNav({ alunoId }: { alunoId: string }) {
  const supabase = await createClient();
  const [{ data: aluno }, { data: materiaisRows }] = await Promise.all([
    supabase.from("profiles").select("id, nome, email").eq("id", alunoId).single(),
    supabase
      .from("materiais")
      .select(
        "materia_id, materias(id, titulo, categoria), material_turmas(turma_id, turmas(turma_membros(aluno_id))), material_alunos(aluno_id)"
      )
      .order("materia_id"),
  ]);

  if (!aluno) return null;

  const materiasMap = new Map<string, { id: string; titulo: string; categoria: string }>();
  ((materiaisRows ?? []) as unknown as Row[]).forEach((row) => {
    if (!row.materias) return;
    const viaTurma = row.material_turmas.some((mt) =>
      mt.turmas?.turma_membros.some((tm) => tm.aluno_id === alunoId)
    );
    const viaAluno = row.material_alunos.some((ma) => ma.aluno_id === alunoId);
    if (viaTurma || viaAluno) materiasMap.set(row.materias.id, row.materias);
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
