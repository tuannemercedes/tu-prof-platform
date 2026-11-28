import { urlCapa } from "@/lib/capas";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MaterialForm from "@/components/material-form";
import MaterialRow from "@/components/material-row";
import SubmitButton from "@/components/submit-button";
import BotaoConfirmar from "@/components/botao-confirmar";
import CapaModulo from "@/components/capa-modulo";
import { rotuloIdioma } from "@/lib/programas";
import { createFase, deleteFase, deleteMaterial, moverFase, moverMaterial, moverParaFase, renomearFase } from "./actions";
import {
  duplicarModulo,
  escolherCapaPronta,
  excluirModulo,
  incluirNoPrograma,
  retirarDoPrograma,
  salvarCapaMateria,
  salvarDadosModulo,
} from "@/app/(admin)/admin/(gestao)/materias/actions";

const campo = "h-[42px] rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[15px]";
const botaoLinha =
  "h-10 px-3.5 rounded-xl border border-[var(--border-strong)] text-sm font-semibold hover:bg-[var(--surface-2)] whitespace-nowrap inline-flex items-center gap-1.5";

export default async function MateriaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ copia?: string }>;
}) {
  const [{ id }, { copia }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();

  const [{ data: materia }, { data: materiais }, { data: turmas }, { data: alunos }, { data: fases }, { data: programas }] = await Promise.all([
    supabase.from("materias").select("id, titulo, capa_path, descricao").eq("id", id).single(),
    supabase
      .from("materiais")
      .select(
        "id, titulo, tipo, ordem, fase_id, conteudo_html, url, visivel_todos, idioma, material_turmas(turma_id, turmas(nome)), material_alunos(aluno_id, profiles(nome, email))",
      )
      .eq("materia_id", id)
      .order("ordem")
      .order("created_at"),
    supabase.from("turmas").select("id, nome, idioma").order("nome"),
    supabase.from("profiles").select("id, nome, email").eq("role", "aluno").order("nome"),
    supabase.from("fases").select("id, titulo, ordem").eq("materia_id", id).order("ordem").order("created_at"),
    supabase.from("programa_materias").select("turma_id").eq("materia_id", id),
  ]);

  if (!materia) notFound();

  const idsProgramas = (programas ?? []).map((p) => p.turma_id);
  const doModulo = (turmas ?? []).filter((t) => idsProgramas.includes(t.id));
  const outros = (turmas ?? []).filter((t) => !idsProgramas.includes(t.id));
  const idiomas = [...new Set(doModulo.map((t) => t.idioma).filter(Boolean))];
  const idiomaPadrao = idiomas.length === 1 ? (idiomas[0] as string) : undefined;

  // "Ver como aluno": a prévia de alguém de um programa que tem este módulo (ou a aluna demonstração).
  let alunoPrevia: string | null = null;
  if (idsProgramas.length) {
    const { data: m } = await supabase.from("turma_membros").select("aluno_id").in("turma_id", idsProgramas).limit(1).maybeSingle();
    alunoPrevia = m?.aluno_id ?? null;
  }
  if (!alunoPrevia) {
    const { data: demo } = await supabase.from("profiles").select("id").eq("email", "demonstracao@tuprof.invalid").maybeSingle();
    alunoPrevia = demo?.id ?? null;
  }
  const linkPrevia = alunoPrevia ? `/previa/${alunoPrevia}/materias/${id}${idiomaPadrao ? `?idioma=${idiomaPadrao}` : ""}` : null;
  const voltar = doModulo[0] ? `/admin/turmas?p=${doModulo[0].id}` : "/admin/materias";

  function renderMaterial(material: NonNullable<typeof materiais>[number], isFirst: boolean, isLast: boolean) {
    const turmasDoMaterial = (material.material_turmas as unknown as { turmas: { nome: string } | null }[])
      .map((mt) => mt.turmas?.nome)
      .filter(Boolean);
    const alunosDoMaterial = (material.material_alunos as unknown as { profiles: { nome: string | null; email: string } | null }[])
      .map((ma) => ma.profiles?.nome || ma.profiles?.email)
      .filter(Boolean);
    const acessos = material.visivel_todos
      ? ["Todos os alunos"]
      : ([...turmasDoMaterial, ...alunosDoMaterial.map((a) => `${a} (individual)`)] as string[]);
    return (
      <MaterialRow
        key={material.id}
        material={material}
        materiaId={id}
        acessos={acessos}
        fases={fases ?? []}
        turmas={turmas ?? []}
        alunos={alunos ?? []}
        turmaIdsLiberadas={(material.material_turmas as unknown as { turma_id: string }[]).map((mt) => mt.turma_id)}
        alunoIdsLiberados={(material.material_alunos as unknown as { aluno_id: string }[]).map((ma) => ma.aluno_id)}
        deleteAction={deleteMaterial}
        moverAction={moverMaterial}
        moverParaFaseAction={moverParaFase}
        isFirst={isFirst}
        isLast={isLast}
      />
    );
  }

  const materiaisSemFase = (materiais ?? []).filter((m) => !m.fase_id);
  const total = materiais?.length ?? 0;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Barra de comandos */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-10 -mt-6 sm:-mt-10 px-4 sm:px-10 py-2.5 bg-[var(--bg)]/85 backdrop-blur border-b border-[var(--border)]">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={voltar} className={botaoLinha}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Voltar
          </Link>
          <nav aria-label="Você está em" className="min-w-0 flex items-center gap-1.5 text-sm text-[var(--text-secondary)] mr-auto">
            <Link href="/admin/materias" className="hover:underline">
              Módulos
            </Link>
            <span aria-hidden="true">›</span>
            <span className="font-medium text-[var(--text-primary)] truncate max-w-[260px]">{materia.titulo}</span>
          </nav>
          {linkPrevia && (
            <a href={linkPrevia} target="_blank" rel="noopener noreferrer" className={botaoLinha}>
              Ver como aluno ↗
            </a>
          )}
          <form action={duplicarModulo}>
            <input type="hidden" name="id" value={id} />
            <BotaoConfirmar
              mensagem="Criar uma cópia deste módulo (capa, etapas e aulas)? A cópia começa sem estar liberada para ninguém."
              className={botaoLinha}
            >
              Duplicar
            </BotaoConfirmar>
          </form>
          <form action={excluirModulo}>
            <input type="hidden" name="id" value={id} />
            <BotaoConfirmar
              mensagem={`Excluir o módulo “${materia.titulo}” com todas as ${total} aulas? Isso não pode ser desfeito.`}
              className={`${botaoLinha} text-[var(--danger-text)]`}
            >
              Excluir
            </BotaoConfirmar>
          </form>
        </div>
      </div>

      {copia === "1" && (
        <p className="m-0 text-sm rounded-xl px-4 py-3 bg-[var(--info-bg)] text-[var(--info-text)]">
          Esta é a cópia. Troque o nome, ajuste as aulas e inclua num programa quando estiver pronta.
        </p>
      )}

      {/* Nome e descrição */}
      <form action={salvarDadosModulo} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={id} />
        <span className="text-xs tracking-[0.1em] uppercase text-[var(--gold-text)] font-semibold">
          Módulo · {total} {total === 1 ? "aula" : "aulas"}
        </span>
        <input
          name="titulo"
          defaultValue={materia.titulo}
          required
          aria-label="Nome do módulo"
          className={`${campo} h-14 font-serif text-[26px] font-semibold`}
        />
        <textarea
          name="descricao"
          rows={2}
          defaultValue={materia.descricao ?? ""}
          placeholder="Uma frase sobre o módulo, que o aluno vê na Trilha. Ex.: Reuniões, apresentações e negociação com clientes."
          aria-label="Descrição"
          className="rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2.5 text-[15px]"
        />
        <div>
          <SubmitButton className="h-10 px-5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-semibold">
            Salvar nome e descrição
          </SubmitButton>
        </div>
      </form>

      {/* Programas */}
      <section className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-3">
        <h2 className="m-0 font-serif text-[22px] font-semibold">Em quais programas</h2>
        {doModulo.length ? (
          <div className="flex flex-wrap gap-2">
            {doModulo.map((t) => (
              <form
                key={t.id}
                action={retirarDoPrograma}
                className="inline-flex items-center gap-2 h-10 pl-3.5 pr-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-2)]"
              >
                <input type="hidden" name="materia_id" value={id} />
                <input type="hidden" name="turma_id" value={t.id} />
                <Link href={`/admin/turmas?p=${t.id}`} className="text-sm font-semibold hover:underline">
                  {t.nome}
                </Link>
                <span className="text-[11px] text-[var(--text-secondary)]">{rotuloIdioma(t.idioma)}</span>
                <BotaoConfirmar
                  mensagem={`Tirar este módulo do programa “${t.nome}”? Os alunos deixam de ver o módulo na Trilha.`}
                  className="w-7 h-7 rounded-full text-[var(--text-faint)] hover:text-[var(--danger-text)] hover:bg-[var(--surface)]"
                >
                  ✕
                </BotaoConfirmar>
              </form>
            ))}
          </div>
        ) : (
          <p className="m-0 text-sm text-[var(--warning-text)]">Este módulo ainda não está em nenhum programa: os alunos não veem.</p>
        )}
        {outros.length > 0 && (
          <form action={incluirNoPrograma} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="materia_id" value={id} />
            <select name="turma_id" required defaultValue="" aria-label="Programa" className={`${campo} flex-1 min-w-[220px]`}>
              <option value="" disabled>
                Incluir em outro programa…
              </option>
              {outros.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome} · {rotuloIdioma(t.idioma)}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="liberar" value="1" defaultChecked /> Liberar as aulas para o programa
            </label>
            <SubmitButton className={botaoLinha}>Incluir</SubmitButton>
          </form>
        )}
      </section>

      <CapaModulo
        id={id}
        titulo={materia.titulo}
        capaUrl={urlCapa(supabase, materia.capa_path)}
        salvarAction={salvarCapaMateria}
        prontaAction={escolherCapaPronta}
      />

      {/* Etapas e aulas */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="m-0 font-serif text-[22px] font-semibold">Etapas e aulas</h2>
          <p className="m-0 text-xs text-[var(--text-secondary)]">
            Ex.: Entender, Praticar, Aplicar. O aluno vê as aulas agrupadas por etapa, na ordem daqui.
          </p>
        </div>

        {(fases ?? []).map((fase, fi) => {
          const materiaisDaFase = (materiais ?? []).filter((m) => m.fase_id === fase.id);
          return (
            <div key={fase.id} className="border border-[var(--border)] rounded-[18px] bg-[var(--surface)] overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-[var(--border-soft)] bg-[var(--surface-2)]">
                <span className="flex flex-col">
                  {[
                    { d: "cima", l: "Subir etapa", ok: fi > 0, path: "M6 15l6-6 6 6" },
                    { d: "baixo", l: "Descer etapa", ok: fi < (fases?.length ?? 0) - 1, path: "M6 9l6 6 6-6" },
                  ].map((b) => (
                    <form key={b.d} action={moverFase}>
                      <input type="hidden" name="id" value={fase.id} />
                      <input type="hidden" name="materia_id" value={id} />
                      <input type="hidden" name="direcao" value={b.d} />
                      <button
                        type="submit"
                        disabled={!b.ok}
                        aria-label={b.l}
                        className="w-6 h-5 flex items-center justify-center text-[var(--text-faint)] disabled:opacity-30"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d={b.path} />
                        </svg>
                      </button>
                    </form>
                  ))}
                </span>
                <form action={renomearFase} className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <input type="hidden" name="id" value={fase.id} />
                  <input type="hidden" name="materia_id" value={id} />
                  <input
                    name="titulo"
                    defaultValue={fase.titulo}
                    required
                    aria-label="Nome da etapa"
                    className="flex-1 h-9 px-2.5 rounded-lg bg-transparent border border-transparent hover:border-[var(--border-strong)] focus:border-[var(--border-strong)] focus:bg-[var(--surface)] text-[15px] font-semibold"
                  />
                  <SubmitButton className="h-8 px-3 rounded-lg border border-[var(--border-strong)] text-xs font-semibold">Renomear</SubmitButton>
                </form>
                <span className="text-xs text-[var(--text-secondary)]">
                  {materiaisDaFase.length} {materiaisDaFase.length === 1 ? "aula" : "aulas"}
                </span>
                <form action={deleteFase}>
                  <input type="hidden" name="id" value={fase.id} />
                  <input type="hidden" name="materia_id" value={id} />
                  <BotaoConfirmar
                    mensagem={`Excluir a etapa “${fase.titulo}”? As aulas dela não são apagadas: ficam em “Sem etapa”.`}
                    className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]"
                  >
                    Excluir etapa
                  </BotaoConfirmar>
                </form>
              </div>
              <ul className="divide-y divide-[var(--border-soft)] list-none m-0 p-0">
                {materiaisDaFase.length ? (
                  materiaisDaFase.map((m, i) => renderMaterial(m, i === 0, i === materiaisDaFase.length - 1))
                ) : (
                  <li className="p-4 text-xs text-[var(--text-faint)]">Nenhuma aula nesta etapa ainda.</li>
                )}
              </ul>
            </div>
          );
        })}

        {materiaisSemFase.length > 0 && (
          <div className="border border-[var(--border)] rounded-[18px] bg-[var(--surface)] overflow-hidden">
            <p className="m-0 px-4 py-3 border-b border-[var(--border-soft)] bg-[var(--surface-2)] text-[15px] font-semibold">Sem etapa</p>
            <ul className="divide-y divide-[var(--border-soft)] list-none m-0 p-0">
              {materiaisSemFase.map((m, i) => renderMaterial(m, i === 0, i === materiaisSemFase.length - 1))}
            </ul>
          </div>
        )}

        <form action={createFase} className="flex gap-2">
          <input type="hidden" name="materia_id" value={id} />
          <input
            type="text"
            name="titulo"
            required
            placeholder="Nova etapa (ex.: Praticar)"
            aria-label="Nome da nova etapa"
            className={`${campo} flex-1`}
          />
          <SubmitButton className={botaoLinha} pendingText="Criando..." savedText="✓ Criada">
            + Etapa
          </SubmitButton>
        </form>
      </section>

      <section id="nova-aula" className="flex flex-col gap-3 scroll-mt-20">
        <h2 className="m-0 font-serif text-[22px] font-semibold">Adicionar aula</h2>
        {doModulo.length > 0 && (
          <p className="m-0 text-xs text-[var(--text-secondary)]">
            Já vem liberada para {doModulo.length === 1 ? "o programa" : "os programas"} deste módulo ({doModulo.map((t) => t.nome).join(", ")}). Dá
            para mudar em &quot;Quem vê&quot;.
          </p>
        )}
        <MaterialForm
          materiaId={id}
          turmas={turmas ?? []}
          alunos={alunos ?? []}
          fases={fases ?? []}
          turmasPadrao={idsProgramas}
          idiomaPadrao={idiomaPadrao}
        />
      </section>
    </div>
  );
}
