import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MaterialCard, { type MaterialCardData } from "@/components/material-card";
import PreviewNav from "@/components/preview-nav";

export default async function PreviewMateriaPage({
  params,
}: {
  params: Promise<{ id: string; materiaId: string }>;
}) {
  const { id, materiaId } = await params;
  const supabase = await createClient();

  const [{ data: materia }, { data: materiais }, { data: progresso }, { data: turmaMembros }] =
    await Promise.all([
      supabase.from("materias").select("id, titulo").eq("id", materiaId).single(),
      supabase
        .from("materiais")
        .select(
          "id, titulo, tipo, conteudo_html, arquivo_path, capa_path, url, ordem, material_turmas(turma_id), material_alunos(aluno_id)"
        )
        .eq("materia_id", materiaId)
        .order("ordem"),
      supabase.from("progresso").select("material_id, concluido").eq("aluno_id", id),
      supabase.from("turma_membros").select("turma_id").eq("aluno_id", id),
    ]);

  if (!materia) notFound();

  const progressoMap = new Map((progresso ?? []).map((p) => [p.material_id, p.concluido]));
  const turmaIdsDoAluno = new Set((turmaMembros ?? []).map((tm) => tm.turma_id));

  const liberados = (materiais ?? []).filter((m) => {
    const viaTurma = (m.material_turmas as { turma_id: string }[]).some((mt) =>
      turmaIdsDoAluno.has(mt.turma_id)
    );
    const viaAluno = (m.material_alunos as { aluno_id: string }[]).some((ma) => ma.aluno_id === id);
    return viaTurma || viaAluno;
  });

  const materiaisComUrl: MaterialCardData[] = await Promise.all(
    liberados.map(async (m) => {
      let signedUrl: string | null = null;
      if (m.tipo === "pdf" && m.arquivo_path) {
        const { data } = await supabase.storage
          .from("materiais")
          .createSignedUrl(m.arquivo_path, 3600);
        signedUrl = data?.signedUrl ?? null;
      }
      const capaUrl = m.capa_path
        ? supabase.storage.from("capas").getPublicUrl(m.capa_path).data.publicUrl
        : null;
      return {
        id: m.id,
        titulo: m.titulo,
        tipo: m.tipo,
        conteudo_html: m.conteudo_html,
        url: m.url,
        signedUrl,
        capaUrl,
        concluido: progressoMap.get(m.id) ?? false,
      };
    })
  );

  return (
    <div className="space-y-6">
      <PreviewNav alunoId={id} />
      <h1 className="text-lg font-semibold">{materia.titulo}</h1>

      {materiaisComUrl.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materiaisComUrl.map((m) => (
            <MaterialCard key={m.id} material={m} readOnly />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-secondary)]">Nenhum material liberado aqui ainda.</p>
      )}
    </div>
  );
}
