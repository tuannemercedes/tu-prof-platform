import TelaCartas from "@/components/telas-aluno/cartas";
import { visaoDoAlunoLogado } from "@/lib/visao";

export default async function AlunoCartasPage() {
  return <TelaCartas v={await visaoDoAlunoLogado()} />;
}
