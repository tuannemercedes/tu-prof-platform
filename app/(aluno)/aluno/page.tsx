import TelaInicio from "@/components/telas-aluno/inicio";
import { visaoDoAlunoLogado } from "@/lib/visao";

export default async function AlunoHomePage() {
  return <TelaInicio v={await visaoDoAlunoLogado()} />;
}
