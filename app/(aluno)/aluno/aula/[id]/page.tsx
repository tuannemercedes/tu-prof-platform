import TelaAula from "@/components/telas-aluno/aula";
import { visaoDoAlunoLogado } from "@/lib/visao";

export default async function AulaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TelaAula v={await visaoDoAlunoLogado()} id={id} />;
}
