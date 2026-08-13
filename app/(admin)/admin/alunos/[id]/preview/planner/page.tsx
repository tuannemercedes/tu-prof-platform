import { createClient } from "@/lib/supabase/server";
import PlannerItemCheckbox from "@/components/planner-item-checkbox";
import PreviewNav from "@/components/preview-nav";

type Item = { id: string; texto: string; concluido: boolean };

export default async function PreviewPlannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: dias } = await supabase
    .from("planner_dias")
    .select("id, semana, titulo, conteudo_html, planner_itens(id, texto, concluido)")
    .eq("aluno_id", id)
    .order("semana")
    .order("ordem");

  const semanas = new Map<number, typeof dias>();
  (dias ?? []).forEach((dia) => {
    if (!semanas.has(dia.semana)) semanas.set(dia.semana, []);
    semanas.get(dia.semana)!.push(dia);
  });

  return (
    <div className="space-y-8">
      <PreviewNav alunoId={id} />
      <div>
        <h1 className="text-lg font-semibold">Planner</h1>
        <p className="text-sm text-gray-500">Tarefas de estudo, no ritmo do aluno.</p>
      </div>

      {[...semanas.entries()].map(([semana, diasDaSemana]) => (
        <section key={semana} className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Semana {semana}
          </h2>
          <div className="space-y-4">
            {diasDaSemana!.map((dia) => {
              const itens = dia.planner_itens as Item[];
              const concluidos = itens.filter((i) => i.concluido).length;
              return (
                <div key={dia.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-medium">{dia.titulo}</p>
                    {itens.length > 0 && (
                      <p className="text-xs text-gray-400">
                        {concluidos}/{itens.length}
                      </p>
                    )}
                  </div>

                  {dia.conteudo_html && (
                    <iframe
                      sandbox="allow-scripts"
                      srcDoc={dia.conteudo_html}
                      className="w-full h-[320px] rounded-md border border-gray-100"
                      title={dia.titulo}
                    />
                  )}

                  {itens.length > 0 && (
                    <div className="space-y-1.5">
                      {itens.map((item) => (
                        <PlannerItemCheckbox
                          key={item.id}
                          itemId={item.id}
                          texto={item.texto}
                          defaultChecked={item.concluido}
                          readOnly
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {!dias?.length && <p className="text-sm text-gray-500">Planner ainda não foi montado.</p>}
    </div>
  );
}
