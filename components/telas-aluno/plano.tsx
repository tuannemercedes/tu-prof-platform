import { createClient } from "@/lib/supabase/server";
import { getTarefasDoAluno } from "@/lib/tarefas";
import { diaISO, quandoCompleto, rotuloIntervalo, segundaDaSemana, somarDias } from "@/lib/datas";
import PlanoSemanas, { type Semana } from "@/components/plano-semanas";
import { doIdioma } from "@/lib/idioma";
import { getLiberados, type Visao, filtroAulas } from "@/lib/visao";
import { getClubeAcessoParaAluno } from "@/lib/clube";

export default async function TelaPlano({ v }: { v: Visao }) {
  const supabase = await createClient();
  const hoje = diaISO(new Date());
  const idioma = v.idioma;
  const lib = await getLiberados(supabase, v);
  const temClube = !v.previa || (await getClubeAcessoParaAluno(supabase, v.alunoId));

  const [todasTarefas, { data: aulas }, { data: temas }, { data: clubeCfg }] = await Promise.all([
    getTarefasDoAluno(supabase, v.alunoId, lib),
    supabase
      .from("aulas")
      .select("id, data, tema, descricao, resumo, status")
      .or(filtroAulas(v))
      .or(`idioma.is.null,idioma.eq.${idioma}`)
      .order("data"),
    supabase.from("clube_temas").select("id, data, tema").order("data"),
    supabase.from("clube_config").select("dia_horario").eq("id", 1).maybeSingle(),
  ]);

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

  (aulas ?? []).forEach((a) => {
    if (!a.data) return;
    semanaDe(diaISO(a.data)).aulas.push({
      id: a.id,
      quando: quandoCompleto(a.data),
      tema: a.tema,
      descricao: a.resumo || a.descricao,
      realizada: a.status === "realizada",
    });
  });

  tarefas.forEach((t) => {
    const ref = t.prazo ?? diaISO(t.criadaEm);
    semanaDe(ref).tarefas.push(t);
  });

  if (clubeCfg && temClube) {
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
      <PlanoSemanas semanas={semanas} indiceInicial={indiceAtual} alunoId={v.alunoId} previa={v.previa} proximaSegunda={somarDias(inicioAtual, 7)} />
      <p className="mt-5 text-[13px] text-[var(--text-secondary)] leading-normal">
        O plano é montado pela sua professora a partir do modelo do programa e ajustado ao seu objetivo.
      </p>
    </div>
  );
}
