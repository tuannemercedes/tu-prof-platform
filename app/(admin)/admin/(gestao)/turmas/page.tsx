import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  adicionarModulo,
  createTurma,
  deleteTurma,
  excluirEtapaModelo,
  moverModulo,
  removerModulo,
  salvarEtapaModelo,
  updateTurmaCalendario,
  updateTurmaNome,
} from "./actions";
import SubmitButton from "@/components/submit-button";
import BotaoConfirmar from "@/components/botao-confirmar";
import { criarModuloNoPrograma } from "../materias/actions";
import { IDIOMAS, rotuloIdioma } from "@/lib/programas";

const campo = "h-[42px] rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[15px]";
const botao = "h-11 px-[18px] rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-sm whitespace-nowrap";
const botaoLinha = "h-10 px-3.5 rounded-xl border border-[var(--border-strong)] text-sm font-medium hover:bg-[var(--surface-2)] whitespace-nowrap";

export default async function ProgramasPage({ searchParams }: { searchParams: Promise<{ p?: string; idioma?: string }> }) {
  const { p, idioma = "todos" } = await searchParams;
  const supabase = await createClient();

  const [
    { data: turmas },
    { data: materias },
    { data: modulos },
    { data: etapas },
    { data: clube },
    { data: clubeTurmas },
    { data: glossario },
    { data: glossarioTurmas },
  ] = await Promise.all([
    supabase
      .from("turmas")
      .select("id, nome, idioma, descricao, calendario_embed_url, turma_membros(count), empresas(nome)")
      .order("ordem")
      .order("nome"),
    supabase.from("materias").select("id, titulo, categoria, materiais(count)").order("ordem"),
    supabase.from("programa_materias").select("turma_id, materia_id, ordem").order("ordem"),
    supabase.from("programa_etapas").select("id, turma_id, periodo, tema, entrega").order("ordem"),
    supabase.from("clube_config").select("visivel_todos").eq("id", 1).maybeSingle(),
    supabase.from("clube_turmas").select("turma_id"),
    supabase.from("glossario_config").select("visivel_todos").eq("id", 1).maybeSingle(),
    supabase.from("glossario_turmas").select("turma_id"),
  ]);

  const lista = (turmas ?? []).filter((t) => idioma === "todos" || t.idioma === idioma || t.idioma === "espanhol_ingles");
  const atual = lista.find((t) => t.id === p) ?? lista[0];
  const qtd = (t: (typeof lista)[number]) => (t.turma_membros as unknown as { count: number }[])[0]?.count ?? 0;
  const nMateriais = (m: { materiais: unknown }) => (m.materiais as { count: number }[])[0]?.count ?? 0;

  const modulosAtual = atual
    ? (modulos ?? [])
        .filter((m) => m.turma_id === atual.id)
        .map((m) => (materias ?? []).find((x) => x.id === m.materia_id))
        .filter((m): m is NonNullable<typeof m> => !!m)
    : [];
  const etapasAtual = atual ? (etapas ?? []).filter((e) => e.turma_id === atual.id) : [];
  const disponiveis = (materias ?? []).filter((m) => m.categoria === "trilha" && !modulosAtual.some((x) => x.id === m.id));

  const recebe: string[] = [];
  if (atual) {
    if (modulosAtual.length) recebe.push("Trilha do programa");
    if (etapasAtual.length) recebe.push("Modelo de plano");
    if (clube && (clube.visivel_todos || (clubeTurmas ?? []).some((c) => c.turma_id === atual.id))) recebe.push("Club Hispano");
    recebe.push("Biblioteca e FIA");
    if (glossario && (glossario.visivel_todos || (glossarioTurmas ?? []).some((g) => g.turma_id === atual.id))) recebe.push("Glossário");
    recebe.push("Certificado");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4 items-end justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 font-serif font-semibold text-[40px] leading-[1.05]">Programas</h1>
          <p className="m-0 text-[15px] text-[var(--text-secondary)]">Monte uma vez. Cada aluno matriculado recebe tudo o que está aqui.</p>
        </div>
        <form action={createTurma} className="flex flex-wrap gap-2">
          <input name="nome" required placeholder="Nome do novo programa" aria-label="Nome do novo programa" className={campo} />
          <select name="idioma" defaultValue="espanhol" aria-label="Idioma" className={campo}>
            {IDIOMAS.map((i) => (
              <option key={i.valor} value={i.valor}>
                {i.rotulo}
              </option>
            ))}
          </select>
          <SubmitButton className={botao} pendingText="Criando..." savedText="✓ Criado">
            Novo programa
          </SubmitButton>
        </form>
      </div>

      <div className="grid gap-5 items-start lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="flex flex-col gap-2.5">
          <span className="text-xs tracking-[0.1em] uppercase text-[var(--text-secondary)] font-semibold">Seus programas</span>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { v: "todos", l: "Todos" },
              { v: "espanhol", l: "Espanhol" },
              { v: "ingles", l: "Inglês" },
            ].map((f) => (
              <Link
                key={f.v}
                href={`/admin/turmas?idioma=${f.v}`}
                aria-current={idioma === f.v ? "page" : undefined}
                className={`h-8 px-3 rounded-full text-xs font-semibold flex items-center border ${
                  idioma === f.v
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]"
                    : "bg-[var(--surface)] border-[var(--border-strong)]"
                }`}
              >
                {f.l}
              </Link>
            ))}
          </div>
          {lista.length ? (
            lista.map((t) => {
              const on = atual?.id === t.id;
              const en = t.idioma === "ingles";
              return (
                <Link
                  key={t.id}
                  href={`/admin/turmas?p=${t.id}&idioma=${idioma}`}
                  aria-current={on ? "page" : undefined}
                  className={`flex flex-col gap-1.5 p-4 rounded-[14px] bg-[var(--surface)] ${
                    on ? "border-2 border-[var(--gold)]" : "border border-[var(--border)] m-px"
                  }`}
                >
                  <span className="flex justify-between items-center gap-2">
                    <span className="text-[15px] font-semibold">{t.nome}</span>
                    <span
                      className="text-[11px] font-semibold px-2 py-[3px] rounded-lg whitespace-nowrap"
                      style={
                        en
                          ? { background: "var(--info-bg)", color: "var(--info-text)" }
                          : { background: "var(--warning-bg)", color: "var(--warning-text)" }
                      }
                    >
                      {rotuloIdioma(t.idioma)}
                    </span>
                  </span>
                  <span className="text-[13px] text-[var(--text-secondary)]">
                    {(t.empresas as unknown as { nome: string } | null)?.nome
                      ? `Corporate · ${(t.empresas as unknown as { nome: string }).nome} · `
                      : ""}
                    {t.descricao ? `${t.descricao} · ` : ""}
                    {qtd(t)} {qtd(t) === 1 ? "aluno" : "alunos"}
                  </span>
                </Link>
              );
            })
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">Nenhum programa ainda. Crie o primeiro acima.</p>
          )}
        </div>

        {atual && (
          <section key={atual.id} className="min-w-0 bg-[var(--surface)] border-2 border-[var(--gold)] rounded-[18px] p-6 flex flex-col gap-[22px]">
            <form action={updateTurmaNome} className="flex flex-col gap-2">
              <input type="hidden" name="id" value={atual.id} />
              <span className="text-xs tracking-[0.1em] uppercase text-[var(--gold-text)] font-semibold">
                Editando: {atual.nome} · {rotuloIdioma(atual.idioma)}
              </span>
              <div className="flex flex-wrap gap-2">
                <input
                  name="nome"
                  defaultValue={atual.nome}
                  required
                  aria-label="Nome do programa"
                  className={`${campo} flex-1 min-w-[200px] font-serif text-[22px] font-semibold`}
                />
                <select name="idioma" defaultValue={atual.idioma ?? "espanhol"} aria-label="Idioma" className={campo}>
                  {IDIOMAS.map((i) => (
                    <option key={i.valor} value={i.valor}>
                      {i.rotulo}
                    </option>
                  ))}
                </select>
              </div>
              <input
                name="descricao"
                defaultValue={atual.descricao ?? ""}
                placeholder="Descrição curta (ex.: planos trimestral, semestral e anual)"
                aria-label="Descrição"
                className={campo}
              />
              <div>
                <SubmitButton className={botaoLinha}>Salvar</SubmitButton>
              </div>
            </form>

            <div className="flex flex-col gap-2.5">
              <span className="text-sm font-semibold">O que o aluno recebe ao entrar</span>
              <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
                {recebe.map((r) => (
                  <div key={r} className="border border-[var(--border)] rounded-xl p-3 flex gap-2.5 items-center bg-[var(--surface-2)]">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--success-text)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                    <span className="text-sm">{r}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-sm font-semibold">Trilha</span>
                <Link href={`/admin/aulas/nova?programa=${atual.id}`} className="text-sm font-semibold text-[var(--gold-text)]">
                  Nova aula
                </Link>
              </div>
              {modulosAtual.map((m, i) => (
                <div key={m.id} className="flex items-center gap-2 border border-[var(--border)] rounded-xl px-3.5 py-2.5">
                  <span className="flex flex-col">
                    {[
                      { d: "cima", l: "Subir", ok: i > 0, path: "M6 15l6-6 6 6" },
                      { d: "baixo", l: "Descer", ok: i < modulosAtual.length - 1, path: "M6 9l6 6 6-6" },
                    ].map((b) => (
                      <form key={b.d} action={moverModulo}>
                        <input type="hidden" name="turma_id" value={atual.id} />
                        <input type="hidden" name="materia_id" value={m.id} />
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
                  <Link href={`/admin/materias/${m.id}`} className="flex-1 text-[15px] font-medium">
                    {m.titulo}
                  </Link>
                  <span className="text-[13px] text-[var(--text-secondary)]">
                    {nMateriais(m)} {nMateriais(m) === 1 ? "aula" : "aulas"}
                  </span>
                  <form action={removerModulo}>
                    <input type="hidden" name="turma_id" value={atual.id} />
                    <input type="hidden" name="materia_id" value={m.id} />
                    <BotaoConfirmar
                      mensagem={`Tirar “${m.titulo}” deste programa? O módulo continua existindo, só some da Trilha destes alunos.`}
                      className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)] ml-2"
                    >
                      Tirar
                    </BotaoConfirmar>
                  </form>
                </div>
              ))}
              <form action={adicionarModulo} className="flex flex-wrap gap-2">
                <input type="hidden" name="turma_id" value={atual.id} />
                <select name="materia_id" aria-label="Módulo" className={`${campo} flex-1 min-w-[200px]`} defaultValue="">
                  <option value="" disabled>
                    {disponiveis.length ? "Escolha um módulo para incluir" : "Todos os módulos já estão aqui"}
                  </option>
                  {disponiveis.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.titulo}
                    </option>
                  ))}
                </select>
                <SubmitButton className={botaoLinha}>Adicionar módulo</SubmitButton>
              </form>
              <form action={criarModuloNoPrograma} className="flex flex-wrap gap-2">
                <input type="hidden" name="turma_id" value={atual.id} />
                <input
                  name="titulo"
                  required
                  placeholder="Ou crie um módulo novo direto aqui"
                  aria-label="Nome do novo módulo"
                  className={`${campo} flex-1 min-w-[200px]`}
                />
                <SubmitButton className={botaoLinha} pendingText="Criando...">
                  Criar e abrir
                </SubmitButton>
                <Link href="/admin/materias" className={`${botaoLinha} flex items-center`}>
                  Ver todos os módulos
                </Link>
              </form>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-sm font-semibold">Modelo de plano</span>
              <p className="m-0 text-[13px] text-[var(--text-secondary)]">
                Na ficha do aluno, &quot;Usar modelo&quot; copia estas etapas para o plano dele.
              </p>
              {etapasAtual.map((e) => (
                <form
                  key={e.id}
                  action={salvarEtapaModelo}
                  className="grid gap-2 items-center [grid-template-columns:minmax(100px,130px)_minmax(0,1fr)_minmax(0,1fr)_auto_auto]"
                >
                  <input type="hidden" name="turma_id" value={atual.id} />
                  <input type="hidden" name="id" value={e.id} />
                  <input name="periodo" defaultValue={e.periodo} aria-label="Período" className={campo} />
                  <input name="tema" defaultValue={e.tema} aria-label="Tema" className={campo} />
                  <input name="entrega" defaultValue={e.entrega ?? ""} placeholder="Entrega real" aria-label="Entrega real" className={campo} />
                  <SubmitButton className={botaoLinha}>Salvar</SubmitButton>
                  <button formAction={excluirEtapaModelo} className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]">
                    Excluir
                  </button>
                </form>
              ))}
              <form
                action={salvarEtapaModelo}
                className="grid gap-2 items-center [grid-template-columns:minmax(100px,130px)_minmax(0,1fr)_minmax(0,1fr)_auto]"
              >
                <input type="hidden" name="turma_id" value={atual.id} />
                <input name="periodo" required placeholder="Ex.: Mês 1" aria-label="Período" className={campo} />
                <input name="tema" required placeholder="Tema" aria-label="Tema" className={campo} />
                <input name="entrega" placeholder="Entrega real" aria-label="Entrega real" className={campo} />
                <SubmitButton className={botaoLinha}>Adicionar</SubmitButton>
              </form>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-[var(--text-secondary)]">Mais opções</summary>
              <div className="pt-3 flex flex-col gap-3">
                <Link href={`/admin/turmas/${atual.id}/conteudos`} className="font-semibold text-[var(--gold-text)]">
                  Ver tudo o que está liberado para este programa →
                </Link>
                <form action={updateTurmaCalendario} className="flex flex-wrap gap-2 items-end">
                  <input type="hidden" name="id" value={atual.id} />
                  <label className="flex-1 min-w-[220px] flex flex-col gap-1.5 text-[13px] font-semibold">
                    Calendário (link de incorporação do Google Agenda)
                    <input type="url" name="calendario_embed_url" defaultValue={atual.calendario_embed_url ?? ""} className={campo} />
                  </label>
                  <SubmitButton className={botaoLinha}>Salvar</SubmitButton>
                </form>
                <form action={deleteTurma}>
                  <input type="hidden" name="id" value={atual.id} />
                  <BotaoConfirmar
                    mensagem={`Excluir o programa “${atual.nome}”? Os alunos saem dele e perdem o acesso ao que vinha do programa. Os módulos continuam existindo.`}
                    className="text-xs text-[var(--danger-text)]"
                  >
                    Excluir este programa
                  </BotaoConfirmar>
                </form>
              </div>
            </details>

            <div className="flex flex-wrap gap-3 items-center justify-between pt-1.5 border-t border-[var(--border-soft)]">
              <span className="text-sm text-[var(--text-secondary)]">
                {qtd(atual)} {qtd(atual) === 1 ? "aluno matriculado" : "alunos matriculados"}
              </span>
              <Link
                href="/admin/alunos#adicionar"
                className="h-11 px-[18px] rounded-xl border border-[var(--accent)] font-semibold text-sm flex items-center"
              >
                Matricular aluno neste programa
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
