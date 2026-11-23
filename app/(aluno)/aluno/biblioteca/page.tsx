import { redirect } from "next/navigation";

export default function BibliotecaPage() {
  redirect("/aluno/acervo?aba=biblioteca");
}
