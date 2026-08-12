import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";
import MaterialCard, { type MaterialCardData } from "@/components/material-card";

type MateriaRelation = { titulo: string; ordem: number } | null;

export default async function AlunoHomePage() {
  const user = await getUser();
  const supabase = await createClient();

  const [{ data: materiais }, { data: progresso }, { data: turmas }] = await Promise.all([
    supabase
      .from("materiais")
      .select(
        "id, titulo, tipo, conteudo_html, arquivo_path, url, ordem, materia_id, materias(titulo, ordem)"
      )
      .order("ordem"),
    supabase.from("progresso").select("material_id, concluido").eq("aluno_id", user!.id),
    supabase.from("turmas").select("id, nome, calendario_embed_url"),
  ]);

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

  const grupos = new Map<
    string,
    { titulo: string; ordem: number; materiais: MaterialCardData[] }
  >();

  (materiais ?? []).forEach((m, i) => {
    const materia = m.materias as unknown as MateriaRelation;
    const key = m.materia_id;
    if (!grupos.has(key)) {
      grupos.set(key, { titulo: materia?.titulo ?? "Outros", ordem: materia?.ordem ?? 0, materiais: [] });
    }
    grupos.get(key)!.materiais.push(materiaisComUrl[i]);
  });

  const gruposOrdenados = [...grupos.values()].sort((a, b) => a.ordem - b.ordem);
  const calendarios = (turmas ?? []).filter((t) => t.calendario_embed_url);

  return (
    <div className="space-y-10">
      {calendarios.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Calendário
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {calendarios.map((t) => (
              <iframe
                key={t.id}
                src={t.calendario_embed_url!}
                className="w-full h-[400px] rounded-lg border border-gray-200"
                title={`Calendário ${t.nome}`}
              />
            ))}
          </div>
        </section>
      )}

      {gruposOrdenados.length ? (
        gruposOrdenados.map((grupo) => (
          <section key={grupo.titulo} className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              {grupo.titulo}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {grupo.materiais.map((m) => (
                <MaterialCard key={m.id} material={m} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <p className="text-sm text-gray-500">Nenhum material liberado ainda.</p>
      )}
    </div>
  );
}
