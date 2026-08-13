import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";
import { calcularJornada } from "@/lib/cronograma";

type MateriaRelation = { id: string; titulo: string; categoria: string } | null;

export default async function AlunoHomePage() {
  const user = await getUser();
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
        .eq("aluno_id", user!.id),
      supabase
        .from("cronograma_itens")
        .select("id, data, tema, descricao")
        .eq("aluno_id", user!.id)
        .order("data"),
      supabase.from("configuracoes").select("chave, valor").eq("chave", "recado_mentora"),
    ]);

  const recadoMentora = config?.[0]?.valor ?? null;
  const { total: totalAulas, semanaAtual, proximaAula } = calcularJornada(cronograma ?? []);

  const progressoMap = new Map(
    (progresso ?? []).map((p) => [p.material_id, p])
  );

  const totalMateriais = materiais?.length ?? 0;
  const totalConcluidos = (materiais ?? []).filter(
    (m) => progressoMap.get(m.id)?.concluido
  ).length;
  const percentualGeral = totalMateriais
    ? Math.round((totalConcluidos / totalMateriais) * 100)
    : 0;

  const porTrilha = new Map<
    string,
    { titulo: string; total: number; concluidos: number }
  >();
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
      ultimoAcessado = {
        materialTitulo: material.titulo,
        trilhaId: materia.id,
        trilhaTitulo: materia.titulo,
      };
    }
  }

  return (
    <div className="space-y-10">
      <div>
        {totalAulas > 0 && (
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Semana {semanaAtual} de {totalAulas}
          </p>
        )}
        <h1 className="text-lg font-semibold">Olá!</h1>
        <p className="text-sm text-gray-500">Aqui está um resumo do seu progresso.</p>
      </div>

      {recadoMentora && (
        <div className="rounded-lg bg-black text-white p-4">
          <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">Recado da mentora</p>
          <p className="text-sm leading-relaxed">{recadoMentora}</p>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Próxima aula</p>
        {proximaAula ? (
          <>
            <p className="text-sm font-medium">{proximaAula.tema}</p>
            <p className="text-xs text-gray-500">
              {new Date(proximaAula.data + "T00:00:00").toLocaleDateString("pt-BR")}
              {proximaAula.descricao ? ` · ${proximaAula.descricao}` : ""}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-500">Nenhuma aula agendada ainda.</p>
        )}
      </div>

      {ultimoAcessado && (
        <Link
          href={`/aluno/materias/${ultimoAcessado.trilhaId}`}
          className="block rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
        >
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            Continuar de onde parou
          </p>
          <p className="text-sm font-medium">{ultimoAcessado.materialTitulo}</p>
          <p className="text-xs text-gray-500">{ultimoAcessado.trilhaTitulo} →</p>
        </Link>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Seu progresso
        </h2>
        <div className="rounded-lg border border-gray-200 p-4 space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-semibold">{percentualGeral}%</p>
            <p className="text-xs text-gray-500">
              {totalConcluidos} de {totalMateriais} materiais concluídos
            </p>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all"
              style={{ width: `${percentualGeral}%` }}
            />
          </div>
        </div>

        {porTrilha.size > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...porTrilha.entries()].map(([id, t]) => (
              <Link
                key={id}
                href={`/aluno/materias/${id}`}
                className="rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors"
              >
                <p className="text-sm font-medium">{t.titulo}</p>
                <p className="text-xs text-gray-500 mb-1.5">
                  {t.concluidos}/{t.total}
                </p>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full"
                    style={{ width: `${t.total ? (t.concluidos / t.total) * 100 : 0}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {totalMateriais === 0 && (
        <p className="text-sm text-gray-500">Nenhum material liberado ainda.</p>
      )}
    </div>
  );
}
