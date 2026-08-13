import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";
import MaterialCard, { type MaterialCardData } from "@/components/material-card";

export default async function AlunoMateriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  const supabase = await createClient();

  const [{ data: materia }, { data: materiais }, { data: progresso }, { data: fases }] =
    await Promise.all([
      supabase.from("materias").select("id, titulo").eq("id", id).single(),
      supabase
        .from("materiais")
        .select("id, titulo, tipo, conteudo_html, arquivo_path, capa_path, url, ordem, fase_id")
        .eq("materia_id", id)
        .order("ordem"),
      supabase.from("progresso").select("material_id, concluido").eq("aluno_id", user!.id),
      supabase.from("fases").select("id, titulo, ordem").eq("materia_id", id).order("ordem"),
    ]);

  if (!materia) notFound();

  const progressoMap = new Map((progresso ?? []).map((p) => [p.material_id, p.concluido]));

  const materiaisComUrl: (MaterialCardData & { fase_id: string | null })[] = await Promise.all(
    (materiais ?? []).map(async (m) => {
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
        fase_id: m.fase_id,
      };
    })
  );

  const semFase = materiaisComUrl.filter((m) => !m.fase_id);

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-semibold">{materia.titulo}</h1>

      {(fases?.length ?? 0) === 0 && semFase.length === 0 && (
        <p className="text-sm text-[var(--text-secondary)]">Nenhum material liberado aqui ainda.</p>
      )}

      {fases?.map((fase) => {
        const materiaisDaFase = materiaisComUrl.filter((m) => m.fase_id === fase.id);
        if (!materiaisDaFase.length) return null;
        return (
          <section key={fase.id} className="space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
              {fase.titulo}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {materiaisDaFase.map((m) => (
                <MaterialCard key={m.id} material={m} />
              ))}
            </div>
          </section>
        );
      })}

      {semFase.length > 0 && (
        <section className="space-y-3">
          {(fases?.length ?? 0) > 0 && (
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Outros</h2>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {semFase.map((m) => (
              <MaterialCard key={m.id} material={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
