import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getUser } from "@/lib/dal";
import { calcularJornada } from "@/lib/cronograma";
import PlannerItemCheckbox from "@/components/planner-item-checkbox";

type MateriaRelation = { id: string; titulo: string; categoria: string } | null;
type ItemPlanner = { id: string; texto: string; concluido: boolean; link_url: string | null };

const DIAS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

function hojePorExtenso() {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

export default async function AlunoHomePage() {
  const user = await getUser();
  const profile = await getProfile();
  const supabase = await createClient();

  const [{ data: materiais }, { data: progresso }, { data: cronograma }, { data: config }, { data: plannerItens }] =
    await Promise.all([
      supabase
        .from("materiais")
        .select("id, titulo, materia_id, materias(id, titulo, categoria)")
        .order("ordem"),
      supabase
        .from("progresso")
        .select("material_id, concluido, acessado_em")
        .eq("aluno_id", user!.id),
      supabase.from("cronograma_itens").select("id, data, tema, descricao").order("data"),
      supabase.from("configuracoes").select("chave, valor").eq("chave", "recado_mentora"),
      supabase
        .from("planner_itens")
        .select("id, texto, concluido, link_url, planner_dias!inner(semana, ordem)")
        .order("concluido"),
    ]);

  const recado = config?.[0]?.valor ?? null;
  const { total: totalAulas, semanaAtual, proximaAula } = calcularJornada(cronograma ?? []);

  const itens = (plannerItens ?? []) as unknown as ItemPlanner[];
  const pendentes = itens.filter((i) => !i.concluido);
  const tarefasDaVez = pendentes.slice(0, 4);

  let ultimo: { titulo: string; trilhaId: string; trilhaTitulo: string; pct: number } | null = null;
  const acessos = (progresso ?? [])
    .filter((p) => p.acessado_em)
    .sort((a, b) => (a.acessado_em! < b.acessado_em! ? 1 : -1));
  if (acessos.length) {
    const material = materiais?.find((m) => m.id === acessos[0].material_id);
    const materia = material?.materias as unknown as MateriaRelation;
    if (material && materia) {
      const daTrilha = (materiais ?? []).filter((m) => m.materia_id === materia.id);
      const feitos = daTrilha.filter((m) =>
        (progresso ?? []).some((p) => p.material_id === m.id && p.concluido)
      ).length;
      ultimo = {
        titulo: material.titulo,
        trilhaId: materia.id,
        trilhaTitulo: materia.titulo,
        pct: daTrilha.length ? Math.round((feitos / daTrilha.length) * 100) : 0,
      };
    }
  }

  const nome = (profile?.nome || "").split(" ")[0];
  const dataAula = proximaAula?.data ? new Date(proximaAula.data + "T12:00:00") : null;
  const nada = !(materiais?.length || itens.length || totalAulas);

  return (
    <div className="space-y-8">
      {/* Cabeçalho azul-marinho */}
      <section className="-mx-4 sm:-mx-10 -mt-6 sm:-mt-10 bg-[var(--navy)] text-[var(--on-navy)] px-6 sm:px-10 pt-8 pb-16 sm:rounded-b-[32px]">
        <div className="max-w-4xl mx-auto space-y-1">
          <p className="text-sm text-[var(--on-navy-muted)] first-letter:uppercase">{hojePorExtenso()}</p>
          <h1 className="font-serif font-semibold text-[38px] leading-[1.05]">
            ¡Hola{nome ? `, ${nome}` : ""}!
          </h1>
          {totalAulas > 0 && (
            <p className="text-sm text-[var(--on-navy-muted)]">
              Semana {semanaAtual} de {totalAulas}
            </p>
          )}
        </div>
      </section>

      {/* Próxima aula, sobreposta ao cabeçalho */}
      <section className="-mt-16 relative rounded-[20px] bg-[var(--surface)] border border-[var(--border)] p-5 card-elevated space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--gold-text)]">Próxima aula</p>
        {proximaAula ? (
          <div className="flex items-center gap-4">
            {dataAula && (
              <div className="w-14 h-16 shrink-0 rounded-xl bg-[var(--navy)] text-[var(--on-navy)] flex flex-col items-center justify-center">
                <span className="text-[11px] text-[var(--gold-light)]">{DIAS[dataAula.getDay()]}</span>
                <span className="font-serif text-[26px] font-semibold leading-none">{dataAula.getDate()}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-base font-semibold">{proximaAula.tema}</p>
              {proximaAula.descricao && (
                <p className="text-sm text-[var(--text-secondary)]">{proximaAula.descricao}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">Nenhuma aula agendada por enquanto.</p>
        )}
      </section>

      {nada && (
        <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-8 text-center space-y-2">
          <p className="font-serif text-2xl font-semibold">Seu espaço está pronto</p>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
            Assim que a sua professora liberar a trilha, as aulas e as tarefas, tudo aparece aqui.
          </p>
        </div>
      )}

      {itens.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl font-semibold">Suas tarefas</h2>
            <span className="text-sm text-[var(--text-secondary)]">
              {itens.length - pendentes.length} de {itens.length} feitas
            </span>
          </div>
          {tarefasDaVez.length ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2">
              {tarefasDaVez.map((item) => (
                <PlannerItemCheckbox
                  key={item.id}
                  itemId={item.id}
                  texto={item.texto}
                  linkUrl={item.link_url}
                  defaultChecked={item.concluido}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">Tudo feito. Muito bem!</p>
          )}
          <Link href="/aluno/planner" className="inline-block text-sm font-semibold text-[var(--gold-text)]">
            Ver o plano completo →
          </Link>
        </section>
      )}

      {ultimo && (
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-semibold">Continue de onde parou</h2>
          <Link
            href={`/aluno/materias/${ultimo.trilhaId}`}
            className="card-lift flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <span className="w-16 h-16 shrink-0 rounded-xl bg-[var(--navy-2)] text-[var(--gold)] flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="flex-1 min-w-0 space-y-1.5">
              <span className="block text-xs text-[var(--text-secondary)]">{ultimo.trilhaTitulo}</span>
              <span className="block text-[15px] font-semibold truncate">{ultimo.titulo}</span>
              <span className="block h-1.5 rounded-full bg-[var(--surface-3)]">
                <span className="block h-1.5 rounded-full bg-[var(--gold)]" style={{ width: `${ultimo.pct}%` }} />
              </span>
            </span>
          </Link>
        </section>
      )}

      {recado && (
        <section className="rounded-2xl bg-[var(--warning-bg)] p-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--warning-text)]">
            Recado da sua professora
          </p>
          <p className="text-[15px] leading-relaxed whitespace-pre-line">{recado}</p>
        </section>
      )}
    </div>
  );
}
