import TelaGlossario from "@/components/telas-aluno/glossario";
import { visaoDoAlunoLogado } from "@/lib/visao";

export default async function AlunoGlossarioPage({ searchParams }: { searchParams: Promise<{ tema?: string }> }) {
  const { tema } = await searchParams;
  return <TelaGlossario v={await visaoDoAlunoLogado()} tema={tema} />;
}
