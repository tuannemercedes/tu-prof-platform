import { redirect } from "next/navigation";

// A busca agora fica dentro da Biblioteca.
export default function BuscaPage() {
  redirect("/aluno/biblioteca");
}
