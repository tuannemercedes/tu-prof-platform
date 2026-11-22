import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/dal";
import { rotuloIdioma } from "@/lib/programas";

type Aluno = {
  id: string;
  nome: string | null;
  email: string;
  turma_membros: { turmas: { nome: string; idioma: string } | null }[];
};

export default async function ProfessorHomePage() {
  const profile = await getProfile();
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, nome, email, turma_membros(turmas(nome, idioma))")
    .eq("professor_id", profile!.id)
    .eq("role", "aluno")
    .order("nome");

  const alunos = (data ?? []) as unknown as Aluno[];
  const primeiroNome = (profile?.nome || "").split(" ")[0];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-semibold">
          {primeiroNome ? `Olá, ${primeiroNome}` : "Olá"}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Estes são os seus alunos na Tu Prof. Registro de aulas, plano e evolução chegam nas
          próximas etapas.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Meus alunos ({alunos.length})</h2>
        <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
          {alunos.length ? (
            alunos.map((aluno) => {
              const programas = aluno.turma_membros
                .map((m) => m.turmas)
                .filter((t): t is { nome: string; idioma: string } => !!t);
              return (
                <li key={aluno.id} className="p-4 space-y-1">
                  <p className="text-sm font-medium">{aluno.nome || aluno.email}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{aluno.email}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {programas.length
                      ? programas.map((p) => `${p.nome} · ${rotuloIdioma(p.idioma)}`).join("  |  ")
                      : "Ainda sem programa"}
                  </p>
                </li>
              );
            })
          ) : (
            <li className="p-4 text-sm text-[var(--text-secondary)]">
              Nenhum aluno com você ainda. A coordenação define isso em Pessoas.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
