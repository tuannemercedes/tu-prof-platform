import TelaModulo from "@/components/telas-aluno/modulo";
import { visaoDoAlunoLogado } from "@/lib/visao";

export default async function AlunoMateriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TelaModulo v={await visaoDoAlunoLogado()} id={id} />;
}
