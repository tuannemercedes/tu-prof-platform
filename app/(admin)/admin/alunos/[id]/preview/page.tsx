import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PreviewNav from "@/components/preview-nav";
import { calcularJornada } from "@/lib/cronograma";
import ProgressRing from "@/components/progress-ring";

type MateriaRelation = { id: string; titulo: string; categoria: string } | null;

export default async function PreviewHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: materiais }, { data: progresso }, { data: cronograma }, { data: config }] =
    await Promise.all([
      supabase
        .from("materiais")
        .select("id, titulo, materia_id, materias(id, titulo, categoria)")
        .order("ordem"),
      supabase
        .from("progresso")
        .select("material_id, concluido, acessado_em")
        .eq("aluno_id", id),
      supabase
        .from("cronograma_itens")
        .select("id, data, tema, descricao")
        .eq("aluno_id", id)
        .order("data"),
      supabase.from("configuracoes").select("chave, valor").eq("chave", "recado_mentora"),
    ]);

  const recadoMentora = config?.[0]?.valor ?? null;
  const { total: totalAulas, semanaAtual, proximaAula } = calcularJornada(cronograma ?? []);

  const progressoMap = new Map((progresso ?? []).map((p) => [p.material_id, p]));

  const totalMateriais = materiais?.length ?? 0;
  const totalConcluidos = (materiais ?? []).filter((m) => progressoMap.get(m.id)?.concluido).length;
  const percentualGeral = totalMateriais ? Math.round((totalConcluidos / totalMateriais) * 100) : 0;

  const porTrilha = new Map<string, { titulo: string; total: number; concluidos: number }>();
  (materiais ?? []).forEach((m) => {
    const materia = m.materias as unknown as MateriaRelation;
    if (!materia || materia.categoria === "fia") return;
    if (!porTrilha.has(materia.id)) {
      porTrilha.set(materia.id, { titulo: materia.titulo, total: 0, concluidos: 0 });
    }
    const entry = porTrilha.get(materia.id)!;
    entry.total += 1;
    if (progressoMap.get(m.id)?.concluido) entry.concluidos += 1;
  });

  let ultimoAcessado: { materialTitulo: string; trilhaId: string; trilhaTitulo: string } | null = null;
  const acessos = (progresso ?? [])
    .filter((p) => p.acessado_em)
    .sort((a, b) => (a.acessado_em! < b.acessado_em! ? 1 : -1));

  if (acessos.length) {
    const material = materiais?.find((m) => m.id === acessos[0].material_id);
    const materia = material?.materias as unknown as MateriaRelation;
    if (material && materia) {
      ultimoAcessado = { materialTitulo: material.titulo, trilhaId: materia.id, trilhaTitulo: materia.titulo };
    }
  }

  const base = `/admin/alunos/${id}/preview`;

  return (
    <div className="space-y-10">
      <PreviewNav alunoId={id} />
      <div>
        {totalAulas > 0 && (
          <p className="text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wide mb-1">
            Semana {semanaAtual} de {totalAulas}
          </p>
        )}
        <h1 className="text-lg font-semibold">Olá!</h1>
        <p className="text-sm text-[var(--text-secondary)]">Aqui está um resumo do seu progresso.</p>
      </div>

      {recadoMentora && (
        <div className="rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] p-4">
          <p className="text-xs text-[var(--text-faint)] uppercase tracking-wide mb-1">Recado da mentora</p>
          <p className="text-sm leading-relaxed">{recadoMentora}</p>
        </div>
      )}

      <div className="rounded-lg border border-[var(--border)] p-4">
        <p className="text-xs text-[var(--text-faint)] uppercase tracking-wide mb-1">Próxima aula</p>
        {proximaAula ? (
          <>
            <p className="text-sm font-medium">{proximaAula.tema}</p>
            <p className="text-xs text-[var(--text-secondary)]">
              {new Date(proximaAula.data + "T00:00:00").toLocaleDateString("pt-BR")}
              {proximaAula.descricao ? ` · ${proximaAula.descricao}` : ""}
            </p>
          </>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">Nenhuma aula agendada ainda.</p>
        )}
      </div>

      {ultimoAcessado && (
        <div className="block rounded-lg border border-[var(--border)] p-4">
          <p className="text-xs text-[var(--text-faint)] uppercase tracking-wide mb-1">Continuar de onde parou</p>
          <p className="text-sm font-medium">{ultimoAcessado.materialTitulo}</p>
          <p className="text-xs text-[var(--text-secondary)]">{ultimoAcessado.trilhaTitulo} →</p>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Seu progresso</h2>
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 card-elevated">
          <div
            className="glow-spot -right-10 -top-10 w-40 h-40"
            style={{ background: "var(--glow-accent)" }}
          />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-center gap-6">
            <div className="relative shrink-0 flex items-center justify-center" style={{ width: 152, height: 152 }}>
              <ProgressRing value={percentualGeral} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tabular-nums">{percentualGeral}%</span>
                <span className="text-[10px] text-[var(--text-faint)] uppercase tracking-wide mt-0.5">
                  concluído
                </span>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs text-[var(--text-faint)] uppercase tracking-wide mb-1">
                Progresso geral
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {totalConcluidos} de {totalMateriais} materiais concluídos
              </p>
            </div>
          </div>
        </div>

        {porTrilha.size > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...porTrilha.entries()].map(([trilhaId, t]) => (
              <Link
                key={trilhaId}
                href={`${base}/materias/${trilhaId}`}
                className="card-lift rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 hover:border-[var(--border-strong)] transition-colors"
              >
                <p className="text-sm font-medium">{t.titulo}</p>
                <p className="text-xs text-[var(--text-secondary)] mb-1.5">
                  {t.concluidos}/{t.total}
                </p>
                <div className="h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] rounded-full"
                    style={{ width: `${t.total ? (t.concluidos / t.total) * 100 : 0}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {totalMateriais === 0 && <p className="text-sm text-[var(--text-secondary)]">Nenhum material liberado ainda.</p>}
    </div>
  );
}
