import TelaEvolucao from "@/components/telas-aluno/evolucao";
import { visaoDoAlunoLogado } from "@/lib/visao";

export default async function EvolucaoPage() {
  return <TelaEvolucao v={await visaoDoAlunoLogado()} />;
}
