import { createClient } from "@/lib/supabase/server";
import { getTarefasDoAluno } from "@/lib/tarefas";
import { diaISO, quandoCompleto, rotuloIntervalo, segundaDaSemana, somarDias } from "@/lib/datas";
import PlanoSemanas, { type Semana } from "@/components/plano-semanas";
import { doIdioma, TEXTOS_IDIOMA } from "@/lib/idioma";
import { getLiberados, rota, type Visao, filtroAulas } from "@/lib/visao";
import { lerPrevia, previaLiberada } from "@/lib/previa";
import { getClubeAcessoParaAluno } from "@/lib/clube";

export default async function TelaPlano({ v }: { v: Visao }) {
  const supabase = await createClient();
  const hoje = diaISO(new Date());
  const agora = new Date().toISOString();
  const idioma = v.idioma;
  const lib = await getLiberados(supabase, v);
  const temClube = !v.previa || (await getClubeAcessoParaAluno(supabase, v.alunoId));

  const [todasTarefas, { data: aulas }, { data: temas }, { data: clubeCfg }, { data: todasEtapas }] = await Promise.all([
    getTarefasDoAluno(supabase, v.alunoId, lib),
    supabase
      .from("aulas")
      .select("id, data, tema, descricao, resumo, status, previa, aluno_id, remarcada_de, idioma")
      .or(filtroAulas(v))
      .order("data"),
    supabase.from("clube_temas").select("id, data, tema").order("data"),
    supabase.from("clube_config").select("dia_horario").eq("id", 1).maybeSingle(),
    supabase.from("plano_etapas").select("id, periodo, tema, entrega, idioma").eq("aluno_id", v.alunoId).order("ordem"),
  ]);
  // Rota de aprendizagem (etapas do plano), só do idioma em que a pessoa está.
  const etapas = (todasEtapas ?? []).filter((e) => doIdioma(e.idioma, idioma));

  const tarefas = todasTarefas.filter((t) => doIdioma(t.idioma, idioma));
  const mapa = new Map<string, Semana>();
  const semanaDe = (iso: string) => {
    const inicio = segundaDaSemana(iso);
    if (!mapa.has(inicio)) {
      mapa.set(inicio, { inicio, rotulo: "", intervalo: rotuloIntervalo(inicio), aulas: [], tarefas: [], club: [] });
    }
    return mapa.get(inicio)!;
  };

  semanaDe(hoje);

  (aulas ?? []).filter((a) => doIdioma(a.idioma, idioma)).forEach((a) => {
    if (!a.data) return;
    semanaDe(diaISO(a.data)).aulas.push({
      id: a.id,
      quando: quandoCompleto(a.data),
      tema: a.tema,
      descricao: a.resumo || a.descricao,
      realizada: a.status === "realizada",
      desmarcada: a.status === "cancelada",
      remarcadaDe: a.remarcada_de ? quandoCompleto(a.remarcada_de) : null,
      remarcarHref: a.status === "agendada" && a.aluno_id && a.data > agora ? rota(v, `/aula/${a.id}`, "#remarcar") : null,
      previaHref: lerPrevia(a.previa) && previaLiberada(a.data) ? rota(v, `/aula/${a.id}`) : null,
    });
  });

  tarefas.forEach((t) => {
    const ref = t.prazo ?? diaISO(t.criadaEm);
    semanaDe(ref).tarefas.push(t);
  });

  if (clubeCfg && temClube && TEXTOS_IDIOMA[idioma].temClube) {
    (temas ?? []).forEach((c) => {
      const d = new Date(c.data + "T12:00:00Z");
      const dia = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" })
        .format(d)
        .replace("-feira", "")
        .replace(".", "");
      semanaDe(c.data).club.push({ id: c.id, tema: c.tema, quando: clubeCfg.dia_horario ? `${dia} · ${clubeCfg.dia_horario}` : dia });
    });
  }

  const inicioAtual = segundaDaSemana(hoje);
  const semanas = [...mapa.values()].sort((a, b) => (a.inicio < b.inicio ? -1 : 1));
  semanas.forEach((s, i) => {
    s.rotulo = `Semana ${i + 1}${s.inicio === inicioAtual ? " · esta semana" : ""}`;
  });
  const indiceAtual = semanas.findIndex((s) => s.inicio === inicioAtual);

  return (
    <div>
      <div className="space-y-1.5 mb-5">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--gold-text)]">Meu plano</p>
        <h1 className="m-0 font-serif font-semibold text-[34px] leading-[1.05]">Tudo da semana num lugar só</h1>
      </div>
      {etapas.length > 0 && (
        <details className="mb-5 rounded-[18px] border border-[var(--border)] bg-[var(--surface)]">
          <summary className="list-none cursor-pointer px-5 min-h-12 py-3 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">Sua rota de aprendizagem</span>
            <span className="text-xs text-[var(--text-secondary)]">{etapas.length} etapas · ver</span>
          </summary>
          <ol className="m-0 px-5 pb-5 list-none flex flex-col gap-3">
            {etapas.map((e, i) => (
              <li key={e.id} className="flex gap-3">
                <span className="w-7 h-7 shrink-0 rounded-full bg-[var(--navy)] text-[var(--gold-light)] text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                <span className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--gold-text)]">{e.periodo}</span>
                  <span className="text-[15px]">{e.tema}</span>
                  {e.entrega && <span className="text-[13px] text-[var(--text-secondary)]">Entrega: {e.entrega}</span>}
                </span>
              </li>
            ))}
          </ol>
        </details>
      )}
      <PlanoSemanas semanas={semanas} indiceInicial={indiceAtual} alunoId={v.alunoId} previa={v.previa} proximaSegunda={somarDias(inicioAtual, 7)} />
      <p className="mt-5 text-[13px] text-[var(--text-secondary)] leading-normal">
        O plano é montado pela sua professora a partir do modelo do programa e ajustado ao seu objetivo.
      </p>
    </div>
  );
}
