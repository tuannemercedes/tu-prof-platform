import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTarefasDoAluno, formatarPrazo } from "@/lib/tarefas";
import { diaISO, diaDoMes, diaSemanaCurto, hojePorExtenso, hora, segundaDaSemana, somarDias } from "@/lib/datas";
import { rotuloIdioma } from "@/lib/programas";
import { doIdioma } from "@/lib/idioma";
import { getLiberados, liberado, nomeDoProfessor, rota, type Visao } from "@/lib/visao";
import TarefaItem from "@/components/tarefa-item";
import ClubeCartao from "@/components/clube-cartao";
import { getClubeAcessoParaAluno } from "@/lib/clube";

type MateriaRelation = { id: string; titulo: string; categoria: string } | null;

export default async function TelaInicio({ v }: { v: Visao }) {
  const supabase = await createClient();
  const agora = new Date().toISOString();
  const hoje = diaISO(new Date());

  const idioma = v.idioma;
  const lib = await getLiberados(supabase, v);

  const [
    todasTarefas,
    { data: proximas },
    { data: todosMateriais },
    { data: progresso },
    { data: config },
    { data: programas },
    professor,
    { data: clubeTemas },
  ] = await Promise.all([
    getTarefasDoAluno(supabase, v.alunoId, lib),
    supabase
      .from("aulas")
      .select("id, data, tema")
      .eq("aluno_id", v.alunoId)
      .eq("status", "agendada")
      .gte("data", agora)
      .or(`idioma.is.null,idioma.eq.${idioma}`)
      .order("data")
      .limit(1),
    supabase.from("materiais").select("id, titulo, materia_id, idioma, materias(id, titulo, categoria)").order("ordem"),
    supabase.from("progresso").select("material_id, concluido, acessado_em").eq("aluno_id", v.alunoId),
    supabase.from("configuracoes").select("chave, valor").eq("chave", "recado_mentora"),
    supabase.from("turma_membros").select("turmas(nome, idioma)").eq("aluno_id", v.alunoId),
    nomeDoProfessor(supabase, v),
    supabase.from("clube_temas").select("id, data, tema").gte("data", hoje).order("data").limit(1),
  ]);

  const tarefas = todasTarefas.filter((t) => doIdioma(t.idioma, idioma));
  const materiais = (todosMateriais ?? []).filter((m) => doIdioma(m.idioma, idioma) && liberado(lib, m.id));

  // Tarefas da semana: pendentes + as feitas com prazo nesta semana
  const segunda = segundaDaSemana(hoje);
  const domingo = somarDias(segunda, 6);
  const daSemana = tarefas.filter(
    (t) => !t.concluida || (t.prazo && t.prazo >= segunda && t.prazo <= domingo)
  );
  const visiveis = daSemana.slice(0, 3);
  const feitas = daSemana.filter((t) => t.concluida).length;

  // Continue de onde parou
  let ultimo: { titulo: string; trilhaId: string; trilhaTitulo: string; pct: number } | null = null;
  const acessos = (progresso ?? [])
    .filter((p) => p.acessado_em)
    .sort((a, b) => (a.acessado_em! < b.acessado_em! ? 1 : -1));
  if (acessos.length) {
    const material = materiais.find((m) => m.id === acessos[0].material_id);
    const materia = material?.materias as unknown as MateriaRelation;
    if (material && materia) {
      const daTrilha = materiais.filter((m) => m.materia_id === materia.id);
      const ok = daTrilha.filter((m) => (progresso ?? []).some((p) => p.material_id === m.id && p.concluido)).length;
      ultimo = {
        titulo: material.titulo,
        trilhaId: materia.id,
        trilhaTitulo: materia.titulo,
        pct: daTrilha.length ? Math.round((ok / daTrilha.length) * 100) : 0,
      };
    }
  }

  // Club Hispano
  let clube: { id: string; tema: string; quando: string; vou: boolean } | null = null;
  const tema = clubeTemas?.[0];
  const temClube = !v.previa || (await getClubeAcessoParaAluno(supabase, v.alunoId));
  if (tema && temClube) {
    const [{ data: cfg }, { data: rsvp }] = await Promise.all([
      supabase.from("clube_config").select("dia_horario").eq("id", 1).maybeSingle(),
      supabase.from("clube_rsvps").select("confirmado").eq("tema_id", tema.id).eq("aluno_id", v.alunoId).maybeSingle(),
    ]);
    if (cfg) {
      const d = new Date(tema.data + "T12:00:00Z");
      const dia = new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "UTC" })
        .format(d)
        .replace("-feira", "");
      clube = { id: tema.id, tema: tema.tema, quando: cfg.dia_horario ? `${dia}, ${cfg.dia_horario}` : dia, vou: rsvp?.confirmado ?? false };
    }
  }

  const nome = (v.nome || "").split(" ")[0];
  const recado = config?.[0]?.valor ?? null;
  const nomeProfessor = professor?.split(" ")[0] ?? null;
  const progs = (programas ?? [])
    .map((p) => p.turmas as unknown as { nome: string; idioma: string } | null)
    .filter((p): p is { nome: string; idioma: string } => !!p);
  const prog = progs.find((p) => doIdioma(p.idioma, idioma)) ?? progs[0];
  const proxima = proximas?.[0];

  return (
    <div className="-mx-4 sm:-mx-10 -mt-6 sm:-mt-10">
      <header className="bg-[var(--navy)] text-[var(--on-navy)] px-6 sm:px-10 pt-7 pb-14 flex flex-col gap-1">
        <p className="m-0 text-[13px] text-[var(--on-navy-muted)]">{hojePorExtenso()}</p>
        <h1 className="m-0 font-serif font-semibold text-[36px] leading-[1.05]">¡Hola{nome ? `, ${nome}` : ""}!</h1>
        {prog && (
          <p className="mt-1 text-sm text-[var(--on-navy-muted)]">
            {prog.nome} · {rotuloIdioma(prog.idioma)}
          </p>
        )}
      </header>

      <div className="px-5 sm:px-10">
        <section className="-mt-9 relative bg-[var(--surface)] rounded-[18px] p-5 shadow-[0_8px_24px_rgba(14,27,51,0.10)] flex flex-col gap-3.5">
          <p className="m-0 text-xs tracking-[0.1em] uppercase text-[var(--gold-text)] font-semibold">Próxima aula</p>
          {proxima?.data ? (
            <>
              <div className="flex gap-3.5 items-center">
                <div className="w-14 h-[60px] shrink-0 rounded-xl bg-[var(--navy)] text-[var(--on-navy)] flex flex-col items-center justify-center">
                  <span className="text-[11px] text-[var(--gold-light)]">{diaSemanaCurto(proxima.data)}</span>
                  <span className="font-serif text-[26px] font-semibold leading-none">{diaDoMes(proxima.data)}</span>
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-base font-semibold">{proxima.tema}</span>
                  <span className="text-[13px] text-[var(--text-secondary)]">
                    {hora(proxima.data)}
                    {nomeProfessor ? ` · com ${nomeProfessor}` : ""}
                  </span>
                </div>
              </div>
              {v.linkAula && (
                <a
                  href={v.linkAula}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-[46px] rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-[15px] flex items-center justify-center"
                >
                  Entrar na aula
                </a>
              )}
            </>
          ) : (
            <p className="m-0 text-sm text-[var(--text-secondary)]">
              Nenhuma aula agendada por enquanto. Assim que a sua professora marcar, ela aparece aqui.
            </p>
          )}
        </section>

        {daSemana.length > 0 && (
          <section className="pt-7 flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="m-0 font-serif font-semibold text-2xl">Tarefas da semana</h2>
              <span className="text-[13px] text-[var(--text-secondary)]">
                {feitas} de {daSemana.length}
              </span>
            </div>
            {visiveis.map((t) => (
              <TarefaItem key={t.id} tarefa={t} alunoId={v.alunoId} previa={v.previa} meta={formatarPrazo(t.prazo) ?? t.origem} />
            ))}
            {daSemana.length > visiveis.length && (
              <Link href={rota(v, "/plano")} className="text-sm font-semibold text-[var(--gold-text)]">
                Ver todas no Plano →
              </Link>
            )}
          </section>
        )}

        {ultimo && (
          <section className="pt-7 flex flex-col gap-3">
            <h2 className="m-0 font-serif font-semibold text-2xl">Continue de onde parou</h2>
            <Link
              href={rota(v, `/materias/${ultimo.trilhaId}`)}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex gap-3.5 items-center"
            >
              <span className="w-16 h-16 shrink-0 rounded-xl bg-[var(--navy-2)] flex items-center justify-center text-[var(--gold-light)]">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="flex-1 min-w-0 flex flex-col gap-1.5">
                <span className="text-xs text-[var(--text-secondary)]">{ultimo.trilhaTitulo}</span>
                <span className="text-[15px] font-semibold truncate">{ultimo.titulo}</span>
                <span className="h-1.5 rounded-[3px] bg-[var(--surface-3)]">
                  <span className="block h-1.5 rounded-[3px] bg-[var(--gold)]" style={{ width: `${ultimo.pct}%` }} />
                </span>
              </span>
            </Link>
          </section>
        )}

        {(recado || clube) && (
          <section className="pt-7 flex flex-col gap-3">
            {recado && (
              <div className="bg-[var(--warning-bg)] rounded-2xl p-[18px] flex flex-col gap-2">
                <span className="text-xs tracking-[0.1em] uppercase text-[var(--warning-text)] font-semibold">
                  Recado da sua professora
                </span>
                <p className="m-0 text-[15px] leading-normal whitespace-pre-line">{recado}</p>
                {nomeProfessor && <span className="text-[13px] text-[var(--text-secondary)]">{nomeProfessor}</span>}
              </div>
            )}
            {clube && <ClubeCartao temaId={clube.id} tema={clube.tema} quando={clube.quando} confirmadoInicial={clube.vou} previa={v.previa} />}
          </section>
        )}
      </div>
    </div>
  );
}
