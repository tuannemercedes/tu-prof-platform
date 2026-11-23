import TelaTrilha from "@/components/telas-aluno/trilha";
import { visaoDoAlunoLogado } from "@/lib/visao";

export default async function TrilhaPage() {
  return <TelaTrilha v={await visaoDoAlunoLogado()} />;
}
