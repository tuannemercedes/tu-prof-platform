import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { quandoCompleto } from "@/lib/datas";
import { lerPrevia, liberaEm, previaLiberada } from "@/lib/previa";
import { nomeDoProfessor, rota, type Visao } from "@/lib/visao";
import PedirRemarcacao from "@/components/pedir-remarcacao";
import PreviaConteudo from "@/components/previa-conteudo";
import MarcarPreviaVista from "@/components/marcar-previa-vista";

// Prévia de uma aula, como o aluno vê.
export default async function TelaAula({ v, id }: { v: Visao; id: string }) {
  const supabase = await createClient();
  const { data: aula } = await supabase
    .from("aulas")
    .select("id, data, tema, status, aluno_id, turma_id, previa, remarcada_de, turmas(nome)")
    .eq("id", id)
    .maybeSingle();
  // Na prévia da equipe, confere se a aula é mesmo deste aluno.
  if (!aula || (v.previa && aula.aluno_id !== v.alunoId && !(aula.turma_id && v.turmas.includes(aula.turma_id)))) notFound();

  const previa = lerPrevia(aula.previa);
  const aberta = previaLiberada(aula.data);
  const grupo = (aula.turmas as unknown as { nome: string } | null)?.nome;
  const futura = aula.status === "agendada";
  const podeRemarcar = futura && !!aula.aluno_id && !!aula.data && aula.data > new Date().toISOString();
  const [pedido, professora] = podeRemarcar
    ? await Promise.all([
        supabase
          .from("pedidos_remarcacao")
          .select("criado_em")
          .eq("aula_id", aula.id)
          .eq("aluno_id", v.alunoId)
          .is("resolvido_em", null)
          .maybeSingle()
          .then((r) => r.data),
        nomeDoProfessor(supabase, v),
      ])
    : [null, ""];

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <Link href={rota(v, "/plano")} className="text-sm font-semibold text-[var(--gold-text)]">
        ← Plano
      </Link>
      <div className="flex flex-col gap-1.5">
        <p className="m-0 text-xs tracking-[0.1em] uppercase text-[var(--gold-text)] font-semibold">
          {aula.status === "cancelada" ? "Aula desmarcada" : previa ? "Prévia da aula" : "Aula"}
          {grupo ? ` · ${grupo}` : ""}
        </p>
        <h1 className="m-0 font-serif font-semibold text-[34px] leading-tight">{aula.tema}</h1>
        {aula.data && (
          <p className="m-0 text-[15px] text-[var(--text-secondary)]">
            {quandoCompleto(aula.data)}
            {aula.remarcada_de && futura ? ` · remarcada (antes: ${quandoCompleto(aula.remarcada_de)})` : ""}
          </p>
        )}
      </div>

      {previa && aberta ? (
        <>
          {!v.previa && <MarcarPreviaVista aulaId={aula.id} />}
          <PreviaConteudo previa={previa} />
        </>
      ) : previa && aula.data ? (
        <p className="m-0 bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-5 text-[15px] text-[var(--text-secondary)]">
          A prévia desta aula abre {quandoCompleto(liberaEm(aula.data).toISOString())}.
        </p>
      ) : (
        <p className="m-0 bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-5 text-[15px] text-[var(--text-secondary)]">
          A prévia desta aula ainda não foi publicada.
        </p>
      )}

      {futura && v.linkAula && aula.aluno_id && (
        <a
          href={v.linkAula}
          target="_blank"
          rel="noopener noreferrer"
          className="h-[46px] rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-[15px] flex items-center justify-center"
        >
          Entrar na aula
        </a>
      )}

      {podeRemarcar && (
        <section id="remarcar" className="scroll-mt-24 bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-5 flex flex-col gap-3">
          <h2 className="m-0 font-serif font-semibold text-[24px]">Precisa remarcar?</h2>
          <PedirRemarcacao
            aulaId={aula.id}
            professora={(professora || "").split(" ")[0] || "A professora"}
            enviadoEm={pedido ? quandoCompleto(pedido.criado_em) : null}
            demonstracao={v.previa}
          />
        </section>
      )}
    </div>
  );
}
