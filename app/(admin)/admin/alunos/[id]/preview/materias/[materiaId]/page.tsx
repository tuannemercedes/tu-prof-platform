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

  const [{ data: materia }, { data: materiais }, { data: progresso }] = await Promise.all([
    supabase.from("materias").select("id, titulo").eq("id", materiaId).single(),
    supabase
      .from("materiais")
      .select("id, titulo, tipo, conteudo_html, arquivo_path, url, ordem")
      .eq("materia_id", materiaId)
      .order("ordem"),
    supabase.from("progresso").select("material_id, concluido").eq("aluno_id", id),
  ]);

  if (!materia) notFound();

  const progressoMap = new Map((progresso ?? []).map((p) => [p.material_id, p.concluido]));

  const materiaisComUrl: MaterialCardData[] = await Promise.all(
    (materiais ?? []).map(async (m) => {
      let signedUrl: string | null = null;
      if (m.tipo === "pdf" && m.arquivo_path) {
        const { data } = await supabase.storage
          .from("materiais")
          .createSignedUrl(m.arquivo_path, 3600);
        signedUrl = data?.signedUrl ?? null;
      }
      return {
        id: m.id,
        titulo: m.titulo,
        tipo: m.tipo,
        conteudo_html: m.conteudo_html,
        url: m.url,
        signedUrl,
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
        <p className="text-sm text-gray-500">Nenhum material liberado aqui ainda.</p>
      )}
    </div>
  );
}
