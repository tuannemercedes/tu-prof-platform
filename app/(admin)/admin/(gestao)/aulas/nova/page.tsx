import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NovaAulaForm from "@/components/nova-aula-form";

export default async function NovaAulaPage({ searchParams }: { searchParams: Promise<{ programa?: string }> }) {
  const { programa } = await searchParams;
  const supabase = await createClient();

  const [{ data: turmas }, { data: materias }, { data: modulos }, { data: alunos }] = await Promise.all([
    supabase.from("turmas").select("id, nome, idioma, turma_membros(count)").order("ordem").order("nome"),
    supabase.from("materias").select("id, titulo").eq("categoria", "trilha").order("ordem"),
    supabase.from("programa_materias").select("turma_id, materia_id, ordem").order("ordem"),
    supabase.from("profiles").select("id, nome, email, turma_membros(turmas(nome))").eq("role", "aluno").order("nome"),
  ]);

  const atual = (turmas ?? []).find((t) => t.id === programa);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href={atual ? `/admin/turmas?p=${atual.id}` : "/admin/turmas"} className="text-sm text-[var(--text-secondary)]">
          Programas{atual ? ` › ${atual.nome}` : ""}
        </Link>
        <h1 className="m-0 font-serif font-semibold text-[40px] leading-[1.05]">Nova aula</h1>
      </div>
      <NovaAulaForm
        programaInicial={atual?.id ?? null}
        programas={(turmas ?? []).map((t) => ({
          id: t.id,
          nome: t.nome,
          idioma: t.idioma,
          alunos: (t.turma_membros as unknown as { count: number }[])[0]?.count ?? 0,
        }))}
        materias={materias ?? []}
        modulos={modulos ?? []}
        alunos={(alunos ?? []).map((a) => ({
          id: a.id,
          nome: a.nome || a.email,
          programa:
            ((a.turma_membros as unknown as { turmas: { nome: string } | null }[])[0]?.turmas?.nome) ?? "Sem programa",
        }))}
      />
    </div>
  );
}
