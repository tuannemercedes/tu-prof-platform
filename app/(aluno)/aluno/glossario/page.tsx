import TelaGlossario from "@/components/telas-aluno/glossario";
import { visaoDoAlunoLogado } from "@/lib/visao";

export default async function AlunoGlossarioPage() {
  return <TelaGlossario v={await visaoDoAlunoLogado()} />;
}
