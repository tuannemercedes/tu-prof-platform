import { createClient } from "@/lib/supabase/server";
import PreviewNav from "@/components/preview-nav";

export default async function PreviewCalendarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: turmas } = await supabase
    .from("turmas")
    .select("id, nome, calendario_embed_url, turma_membros!inner(aluno_id)")
    .eq("turma_membros.aluno_id", id);

  const calendarios = (turmas ?? []).filter((t) => t.calendario_embed_url);

  return (
    <div className="space-y-6">
      <PreviewNav alunoId={id} />
      <h1 className="text-lg font-semibold">Calendário</h1>

      {calendarios.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {calendarios.map((t) => (
            <iframe
              key={t.id}
              src={t.calendario_embed_url!}
              className="w-full h-[500px] rounded-lg border border-gray-200"
              title={`Calendário ${t.nome}`}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Nenhum calendário configurado ainda.</p>
      )}
    </div>
  );
}
