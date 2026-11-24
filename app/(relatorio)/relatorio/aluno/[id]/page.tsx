import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { getRelatorioAluno, mesAnterior, mesAtual, mesValido, nomeDoMes, proximoMes } from "@/lib/relatorio-aluno";
import { quandoCompleto } from "@/lib/datas";
import RelatorioAlunoDoc from "@/components/relatorio-aluno-doc";
import { BotaoImprimir } from "@/components/relatorio-acoes";
import SubmitButton from "@/components/submit-button";
import { salvarRelatorioAluno } from "@/app/relatorio-aluno-actions";

// Relatório mensal individual (equipe): escrever o comentário, publicar e salvar em PDF.
export default async function RelatorioAlunoEquipe({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mes?: string }>;
}) {
  await requireStaff();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const mes = mesValido(sp.mes) ?? mesAtual();
  const supabase = await createClient();
  const r = await getRelatorioAluno(supabase, id, mes);
  if (!r.aluno) notFound();
  const publicado = r.relatorio?.publicado_em;

  return (
    <div className="min-h-screen bg-[#f3efe6] print:bg-white text-[#0e1b33] px-4 py-6 print:p-0 flex flex-col gap-5">
      <div className="print:hidden max-w-[820px] w-full mx-auto flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/admin/alunos/${id}`} className="text-sm font-semibold text-[#8a6a1f]">
            ← Voltar para {r.aluno.nome}
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`?mes=${mesAnterior(mes)}`} className="h-10 px-3 rounded-lg border border-[#c8c2b4] text-sm flex items-center">
              ←
            </Link>
            <span className="text-sm font-semibold capitalize min-w-[150px] text-center">{nomeDoMes(mes)}</span>
            <Link href={`?mes=${proximoMes(mes)}`} className="h-10 px-3 rounded-lg border border-[#c8c2b4] text-sm flex items-center">
              →
            </Link>
            <BotaoImprimir />
          </div>
        </div>

        <form action={salvarRelatorioAluno} className="bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-[0_4px_16px_rgba(14,27,51,0.06)]">
          <input type="hidden" name="aluno_id" value={id} />
          <input type="hidden" name="mes" value={mes} />
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
            Seu comentário do mês
            <textarea
              name="comentario"
              rows={5}
              defaultValue={r.relatorio?.comentario ?? ""}
              placeholder="O que melhorou, o que ainda trava e o foco do próximo mês. Curto e concreto."
              className="rounded-[10px] border border-[#c8c2b4] px-3 py-2.5 text-[15px] font-normal leading-relaxed"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <SubmitButton className="h-10 px-4 rounded-xl border border-[#0e1b33] text-sm font-semibold">Salvar rascunho</SubmitButton>
            {publicado ? (
              <span className="text-sm text-[#1f6b3a] font-semibold">✓ Publicado {quandoCompleto(publicado)}: o aluno já vê e recebeu por e-mail</span>
            ) : (
              <button
                type="submit"
                name="publicar"
                value="1"
                className="h-10 px-4 rounded-xl bg-[#0e1b33] text-white text-sm font-semibold"
              >
                Publicar e enviar ao aluno
              </button>
            )}
          </div>
          <p className="m-0 text-xs text-[#5b6372]">
            O resto do relatório (aulas, tarefas e evolução) é montado sozinho com o que está na plataforma.
          </p>
        </form>
      </div>

      <RelatorioAlunoDoc
        r={r}
        comentario={
          r.relatorio?.comentario ? (
            <p className="m-0 text-[15px] leading-relaxed whitespace-pre-line">{r.relatorio.comentario}</p>
          ) : (
            <p className="m-0 text-[15px] text-[#5b6372] italic">Escreva o comentário acima.</p>
          )
        }
      />
    </div>
  );
}
