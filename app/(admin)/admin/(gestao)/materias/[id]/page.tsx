import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MaterialForm from "@/components/material-form";
import MaterialRow from "@/components/material-row";
import SubmitButton from "@/components/submit-button";
import { createFase, deleteFase, deleteMaterial, moverMaterial, moverParaFase } from "./actions";
import { salvarCapaMateria, updateMateriaTitulo } from "@/app/(admin)/admin/(gestao)/materias/actions";

export default async function MateriaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: materia }, { data: materiais }, { data: turmas }, { data: alunos }, { data: fases }] =
    await Promise.all([
      supabase.from("materias").select("id, titulo, capa_path, descricao").eq("id", id).single(),
      supabase
        .from("materiais")
        .select(
          "id, titulo, tipo, ordem, fase_id, conteudo_html, url, visivel_todos, idioma, material_turmas(turma_id, turmas(nome)), material_alunos(aluno_id, profiles(nome, email))"
        )
        .eq("materia_id", id)
        .order("ordem")
        .order("created_at"),
      supabase.from("turmas").select("id, nome").order("nome"),
      supabase.from("profiles").select("id, nome, email").eq("role", "aluno").order("nome"),
      supabase.from("fases").select("id, titulo, ordem").eq("materia_id", id).order("ordem"),
    ]);

  if (!materia) notFound();

  function renderMaterial(material: NonNullable<typeof materiais>[number], isFirst: boolean, isLast: boolean) {
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

    const acessos = material.visivel_todos
      ? ["Todos os alunos"]
      : ([...turmasDoMaterial, ...alunosDoMaterial.map((a) => `${a} (individual)`)] as string[]);

    const turmaIdsLiberadas = (
      material.material_turmas as unknown as { turma_id: string }[]
    ).map((mt) => mt.turma_id);

    const alunoIdsLiberados = (
      material.material_alunos as unknown as { aluno_id: string }[]
    ).map((ma) => ma.aluno_id);

    return (
      <MaterialRow
        key={material.id}
        material={material}
        materiaId={id}
        acessos={acessos}
        fases={fases ?? []}
        turmas={turmas ?? []}
        alunos={alunos ?? []}
        turmaIdsLiberadas={turmaIdsLiberadas}
        alunoIdsLiberados={alunoIdsLiberados}
        deleteAction={deleteMaterial}
        moverAction={moverMaterial}
        moverParaFaseAction={moverParaFase}
        isFirst={isFirst}
        isLast={isLast}
      />
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

      <form action={salvarCapaMateria} className="space-y-3 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-5">
        <input type="hidden" name="id" value={id} />
        <h2 className="m-0 text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Capa do módulo</h2>
        <p className="m-0 text-xs text-[var(--text-secondary)]">
          Aparece na Trilha do aluno e no topo do módulo. Use uma imagem horizontal (ex.: 1600 × 900). Sem imagem, o módulo usa a capa azul da marca.
        </p>
        <div className="flex flex-wrap gap-4 items-start">
          <div className="relative w-56 aspect-video rounded-xl overflow-hidden shrink-0">
            {materia.capa_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={supabase.storage.from("capas").getPublicUrl(materia.capa_path).data.publicUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="capa-padrao w-full h-full flex items-end p-3 text-[#e9cf8a] font-serif font-semibold">{materia.titulo}</div>
            )}
          </div>
          <div className="flex-1 min-w-[220px] space-y-2">
            <input type="file" name="capa" accept="image/*" className="block text-sm" />
            {materia.capa_path && (
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" name="remover_capa" value="1" /> Remover a imagem atual
              </label>
            )}
            <textarea
              name="descricao"
              rows={2}
              defaultValue={materia.descricao ?? ""}
              placeholder="Uma frase sobre o módulo (opcional). Ex.: Reuniões, apresentações e negociação com clientes."
              className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
            />
            <SubmitButton className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2" pendingText="Salvando..." savedText="✓ Salvo">
              Salvar capa
            </SubmitButton>
          </div>
        </div>
      </form>

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
                      materiaisDaFase.map((m, i) => renderMaterial(m, i === 0, i === materiaisDaFase.length - 1))
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
            {materiaisSemFase.map((m, i) => renderMaterial(m, i === 0, i === materiaisSemFase.length - 1))}
          </ul>
        </section>
      )}
    </div>
  );
}
