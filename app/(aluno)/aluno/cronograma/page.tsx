import { redirect } from "next/navigation";

// Agora tudo fica no Plano (aula, tarefas e Club por semana).
export default function Page() {
  redirect("/aluno/plano");
}
