import TelaPlano from "@/components/telas-aluno/plano";
import { visaoDoAlunoLogado } from "@/lib/visao";

export default async function PlanoPage() {
  return <TelaPlano v={await visaoDoAlunoLogado()} />;
}
