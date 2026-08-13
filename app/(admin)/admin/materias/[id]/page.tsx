import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MaterialForm from "@/components/material-form";
import { deleteMaterial } from "./actions";

const TIPO_LABELS: Record<string, string> = {
  html: "Página HTML",
  pdf: "PDF",
  video: "Vídeo",
  playlist: "Playlist",
  podcast: "Podcast",
  link_externo: "Link externo",
};

export default async function MateriaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: materia }, { data: materiais }, { data: turmas }, { data: alunos }] =
    await Promise.all([
      supabase.from("materias").select("id, titulo").eq("id", id).single(),
      supabase
        .from("materiais")
        .select(
          "id, titulo, tipo, ordem, material_turmas(turma_id, turmas(nome)), material_alunos(aluno_id, profiles(nome, email))"
        )
        .eq("materia_id", id)
        .order("ordem"),
      supabase.from("turmas").select("id, nome").order("nome"),
      supabase.from("profiles").select("id, nome, email").eq("role", "aluno").order("nome"),
    ]);

  if (!materia) notFound();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <Link href="/admin/materias" className="text-xs text-gray-500 hover:underline">
          ← Matérias
        </Link>
        <h1 className="text-lg font-semibold">{materia.titulo}</h1>
      </div>

      <MaterialForm materiaId={id} turmas={turmas ?? []} alunos={alunos ?? []} />

      <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
        {materiais?.length ? (
          materiais.map((material) => {
            const turmasDoMaterial = (
              material.material_turmas as unknown as { turmas: { nome: string } | null }[]
            )
              .map((mt) => mt.turmas?.nome)
              .filter(Boolean);

            const alunosDoMaterial = (
              material.material_alunos as unknown as {
                profiles: { nome: string | null; email: string } | null;
              }[]
            )
              .map((ma) => ma.profiles?.nome || ma.profiles?.email)
              .filter(Boolean);

            const acessos = [...turmasDoMaterial, ...alunosDoMaterial.map((a) => `${a} (individual)`)];

            return (
              <li key={material.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{material.titulo}</p>
                  <p className="text-xs text-gray-500">
                    {TIPO_LABELS[material.tipo] ?? material.tipo}
                    {acessos.length > 0 && ` · ${acessos.join(", ")}`}
                    {acessos.length === 0 && " · ninguém tem acesso ainda"}
                  </p>
                </div>
                <form action={deleteMaterial}>
                  <input type="hidden" name="id" value={material.id} />
                  <input type="hidden" name="materia_id" value={id} />
                  <button type="submit" className="text-xs text-gray-400 hover:text-red-600">
                    Excluir
                  </button>
                </form>
              </li>
            );
          })
        ) : (
          <li className="p-4 text-sm text-gray-500">Nenhum material ainda.</li>
        )}
      </ul>
    </div>
  );
}
