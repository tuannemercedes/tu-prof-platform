import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";
import { getRelatorioAluno, mesValido } from "@/lib/relatorio-aluno";
import RelatorioAlunoDoc from "@/components/relatorio-aluno-doc";
import { BotaoImprimir } from "@/components/relatorio-acoes";

// Relatório mensal publicado, como o aluno vê.
export default async function RelatorioDoAluno({ params }: { params: Promise<{ mes: string }> }) {
  const { mes: m } = await params;
  const mes = mesValido(m);
  const user = await getUser();
  if (!mes || !user) notFound();
  const supabase = await createClient();
  const r = await getRelatorioAluno(supabase, user.id, mes);
  if (!r.relatorio?.publicado_em) notFound();
  return (
    <div className="flex flex-col gap-4">
      <div className="print:hidden flex items-center justify-between gap-3">
        <Link href="/aluno/evolucao" className="text-sm font-semibold text-[var(--gold-text)]">
          ← Evolução
        </Link>
        <BotaoImprimir />
      </div>
      <RelatorioAlunoDoc r={r} comentario={<p className="m-0 text-[15px] leading-relaxed whitespace-pre-line">{r.relatorio.comentario}</p>} />
    </div>
  );
}
