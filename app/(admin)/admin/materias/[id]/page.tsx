import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MaterialForm from "@/components/material-form";
import SubmitButton from "@/components/submit-button";
import { createFase, deleteFase, deleteMaterial } from "./actions";
import { updateMateriaTitulo } from "@/app/(admin)/admin/materias/actions";

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

  const [{ data: materia }, { data: materiais }, { data: turmas }, { data: alunos }, { data: fases }] =
    await Promise.all([
      supabase.from("materias").select("id, titulo").eq("id", id).single(),
      supabase
        .from("materiais")
        .select(
          "id, titulo, tipo, ordem, fase_id, material_turmas(turma_id, turmas(nome)), material_alunos(aluno_id, profiles(nome, email))"
        )
        .eq("materia_id", id)
        .order("ordem"),
      supabase.from("turmas").select("id, nome").order("nome"),
      supabase.from("profiles").select("id, nome, email").eq("role", "aluno").order("nome"),
      supabase.from("fases").select("id, titulo, ordem").eq("materia_id", id).order("ordem"),
    ]);

  if (!materia) notFound();

  function renderMaterial(material: NonNullable<typeof materiais>[number]) {
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
      <li key={material.id} className="p-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{material.titulo}</p>
          <p className="text-xs text-[var(--text-secondary)]">
            {TIPO_LABELS[material.tipo] ?? material.tipo}
            {acessos.length > 0 && ` · ${acessos.join(", ")}`}
            {acessos.length === 0 && " · ninguém tem acesso ainda"}
          </p>
        </div>
        <form action={deleteMaterial}>
          <input type="hidden" name="id" value={material.id} />
          <input type="hidden" name="materia_id" value={id} />
          <button type="submit" className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]">
            Excluir
          </button>
        </form>
      </li>
    );
  }

  const materiaisSemFase = (materiais ?? []).filter((m) => !m.fase_id);

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-2">
        <Link href="/admin/materias" className="text-xs text-[var(--text-secondary)] hover:underline">
          ← Matérias
        </Link>
        <form action={updateMateriaTitulo} className="flex gap-2 max-w-sm">
          <input type="hidden" name="id" value={id} />
          <input
            type="text"
            name="titulo"
            defaultValue={materia.titulo}
            required
            className="bg-[var(--surface)] flex-1 rounded-md border border-[var(--border-strong)] px-3 py-1.5 text-lg font-semibold"
          />
          <SubmitButton className="text-xs rounded-md border border-[var(--border-strong)] px-3 py-1.5 hover:bg-[var(--surface-2)] shrink-0 whitespace-nowrap">
            Salvar nome
          </SubmitButton>
        </form>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Fases (módulos)
        </h2>
        <p className="text-xs text-[var(--text-secondary)]">
          Organize os materiais em fases (ex: &quot;Módulo 1 — Básico&quot;). O
          aluno vê o progresso de cada fase na barra lateral.
        </p>
        <form action={createFase} className="flex gap-2">
          <input type="hidden" name="materia_id" value={id} />
          <input
            type="text"
            name="titulo"
            required
            placeholder="Nome da fase (ex: Módulo 1)"
            className="bg-[var(--surface)] flex-1 rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
          />
          <SubmitButton
            className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 btn-glow whitespace-nowrap"
            pendingText="Criando..."
            savedText="✓ Criada!"
          >
            Criar
          </SubmitButton>
        </form>

        {fases?.length ? (
          <div className="space-y-3">
            {fases.map((fase) => {
              const materiaisDaFase = (materiais ?? []).filter((m) => m.fase_id === fase.id);
              return (
                <div key={fase.id} className="border border-[var(--border)] rounded-lg">
                  <div className="flex items-center justify-between p-3 border-b border-[var(--border-soft)] bg-[var(--surface-2)]">
                    <p className="text-sm font-medium">{fase.titulo}</p>
                    <form action={deleteFase}>
                      <input type="hidden" name="id" value={fase.id} />
                      <input type="hidden" name="materia_id" value={id} />
                      <button type="submit" className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]">
                        Excluir fase
                      </button>
                    </form>
                  </div>
                  <ul className="divide-y divide-[var(--border-soft)]">
                    {materiaisDaFase.length ? (
                      materiaisDaFase.map(renderMaterial)
                    ) : (
                      <li className="p-3 text-xs text-[var(--text-faint)]">Nenhum material nessa fase ainda.</li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-faint)]">
            Nenhuma fase ainda — sem fases, os materiais aparecem direto na trilha.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Adicionar material
        </h2>
        <MaterialForm materiaId={id} turmas={turmas ?? []} alunos={alunos ?? []} fases={fases ?? []} />
      </section>

      {materiaisSemFase.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            Sem fase
          </h2>
          <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
            {materiaisSemFase.map(renderMaterial)}
          </ul>
        </section>
      )}
    </div>
  );
}
