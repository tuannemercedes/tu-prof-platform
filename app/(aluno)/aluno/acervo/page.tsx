import TelaAcervo from "@/components/telas-aluno/acervo";
import { visaoDoAlunoLogado } from "@/lib/visao";

export default async function AcervoPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { aba } = await searchParams;
  return <TelaAcervo v={await visaoDoAlunoLogado()} aba={aba} />;
}
