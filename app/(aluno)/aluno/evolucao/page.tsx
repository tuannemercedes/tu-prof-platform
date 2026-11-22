import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";
import { getTrilhasDoAluno, pct } from "@/lib/trilhas";
import CabecalhoPagina from "@/components/cabecalho-pagina";

function Barra({ valor, cor = "var(--gold)" }: { valor: number; cor?: string }) {
  return (
    <div className="h-2 rounded-full bg-[var(--surface-3)]" role="presentation">
      <div className="h-2 rounded-full" style={{ width: `${valor}%`, background: cor }} />
    </div>
  );
}

export default async function EvolucaoPage() {
  const user = await getUser();
  const supabase = await createClient();

  const [todas, { data: itens }] = await Promise.all([
    getTrilhasDoAluno(supabase, user!.id),
    supabase.from("planner_itens").select("id, concluido, planner_dias!inner(id)"),
  ]);

  const trilhas = todas.filter((t) => t.categoria !== "fia");
  const totalAulas = trilhas.reduce((a, t) => a + t.total, 0);
  const aulasFeitas = trilhas.reduce((a, t) => a + t.concluidos, 0);
  const totalTarefas = itens?.length ?? 0;
  const tarefasFeitas = (itens ?? []).filter((i) => i.concluido).length;

  return (
    <div>
      <CabecalhoPagina
        sobretitulo="Minha evolução"
        titulo="O que você já percorreu"
        descricao="Seu progresso na trilha e nas tarefas. Os comentários e checkpoints da sua professora também vão aparecer aqui."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
          <div className="flex items-baseline justify-between">
            <p className="text-[15px] font-semibold">Trilha</p>
            <p className="font-serif text-3xl font-semibold">{pct(aulasFeitas, totalAulas)}%</p>
          </div>
          <Barra valor={pct(aulasFeitas, totalAulas)} />
          <p className="text-sm text-[var(--text-secondary)]">
            {aulasFeitas} de {totalAulas} aulas concluídas
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
          <div className="flex items-baseline justify-between">
            <p className="text-[15px] font-semibold">Tarefas</p>
            <p className="font-serif text-3xl font-semibold">{pct(tarefasFeitas, totalTarefas)}%</p>
          </div>
          <Barra valor={pct(tarefasFeitas, totalTarefas)} cor="var(--accent)" />
          <p className="text-sm text-[var(--text-secondary)]">
            {tarefasFeitas} de {totalTarefas} tarefas feitas
          </p>
        </div>
      </div>

      {trilhas.length > 0 && (
        <section className="mt-8 space-y-3">
          <h2 className="font-serif text-2xl font-semibold">Por módulo</h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border-soft)]">
            {trilhas.map((t) => (
              <Link key={t.id} href={`/aluno/materias/${t.id}`} className="block p-4 space-y-2 hover:bg-[var(--surface-2)]">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium">{t.titulo}</span>
                  <span className="text-[var(--text-secondary)]">
                    {t.concluidos}/{t.total}
                  </span>
                </div>
                <Barra valor={pct(t.concluidos, t.total)} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-dashed border-[var(--gold)] p-5 flex items-center gap-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold-text)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="9" r="6" />
          <path d="M8.5 14L7 22l5-3 5 3-1.5-8" />
        </svg>
        <div>
          <p className="text-[15px] font-semibold">Certificado Tu Prof</p>
          <p className="text-sm text-[var(--text-secondary)]">Fica disponível aqui ao final do seu programa.</p>
        </div>
      </section>
    </div>
  );
}
