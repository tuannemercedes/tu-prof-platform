import { redirect } from "next/navigation";

// A área do professor agora é o mesmo painel da equipe, filtrado pelos alunos dele.
export default function ProfessorPage() {
  redirect("/admin");
}
