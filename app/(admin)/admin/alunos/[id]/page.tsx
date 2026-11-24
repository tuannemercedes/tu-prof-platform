import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/dal";
import { diaISO, quandoCompleto, diaCurtoComMes } from "@/lib/datas";
import { rotuloIdioma } from "@/lib/programas";
import { lerCompetencias, nivel } from "@/lib/evolucao";
import { idiomasDosProgramas, ROTULO_IDIOMA, type Idioma } from "@/lib/idioma";
import PreviaForm from "@/components/previa-form";
import CertificadosAluno from "@/components/certificados-aluno";
import SubmitButton from "@/components/submit-button";
import RegistrarAulaForm from "@/components/registrar-aula-form";
import CheckpointForm from "@/components/checkpoint-form";
import GlossarioForm from "@/components/glossario-form";
import GlossarioImportForm from "@/components/glossario-import-form";
import GlossarioTermoRow from "@/components/glossario-termo-row";
import {
  agendarAula,
  aplicarModelo,
  comentarEntrega,
  criarTarefa,
  excluirAula,
  excluirEtapa,
  excluirTarefa,
  salvarDadosAluno,
  salvarEtapa,
} from "./actions";

const card = "bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-[22px] flex flex-col gap-3.5";
const h2 = "m-0 font-serif font-semibold text-[26px]";
const campo = "h-[42px] rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[15px] font-normal";
const botao = "h-[42px] px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-sm";
const botaoLinha = "h-[38px] px-3.5 rounded-xl border border-[var(--border-strong)] text-sm font-medium hover:bg-[var(--surface-2)]";

const ENTREGA_ROTULO: Record<string, string> = { feito: "Marcar como feita", texto: "Texto", audio: "Áudio", link: "Link externo" };

export default async function FichaAlunoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aba?: string; idioma?: string }>;
}) {
  const { id } = await params;
  const { aba = "aulas", idioma: idiomaParam } = await searchParams;
  const eu = await getProfile();
  const supabase = await createClient();

  const { data: aluno } = await supabase
    .from("profiles")
    .select("id, nome, email, role, professor_id, objetivo, foco, horario, plano_nome, link_aula")
    .eq("id", id)
    .maybeSingle();
  if (!aluno || aluno.role !== "aluno") notFound();

  const [{ data: membros }, { data: todasAulas }, { data: todasEtapas }, { data: todosCheckpoints }, { data: cfg }, { data: todasTarefas }, { data: entregas }, { data: termosAluno }, { data: professor }] =
    await Promise.all([
      supabase.from("turma_membros").select("turma_id, turmas(id, nome, idioma)").eq("aluno_id", id),
      supabase.from("aulas").select("id, data, tema, descricao, resumo, status, idioma, previa").eq("aluno_id", id).order("data", { ascending: false }),
      supabase.from("plano_etapas").select("id, periodo, tema, entrega, idioma").eq("aluno_id", id).order("ordem"),
      supabase.from("checkpoints").select("id, data, titulo, niveis, comentario, idioma").eq("aluno_id", id).order("data", { ascending: false }),
      supabase.from("configuracoes").select("valor").eq("chave", "competencias").maybeSingle(),
      supabase.from("tarefas").select("id, texto, entrega, prazo, created_at, aluno_id, idioma").eq("aluno_id", id).order("created_at", { ascending: false }),
      supabase.from("tarefa_entregas").select("tarefa_id, concluida, resposta, arquivo_path, comentario").eq("aluno_id", id),
      supabase
        .from("glossario_termos")
        .select("id, termo, definicao, exemplo, categoria, idioma")
        .eq("aluno_id", id)
        .order("termo"),
      aluno.professor_id
        ? supabase.from("profiles").select("nome, email").eq("id", aluno.professor_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const programas = (membros ?? [])
    .map((m) => m.turmas as unknown as { id: string; nome: string; idioma: string } | null)
    .filter((t): t is { id: string; nome: string; idioma: string } => !!t);

  const idiomas = idiomasDosProgramas(programas.map((p) => p.idioma));
  const idioma: Idioma = idiomas.includes(idiomaParam as Idioma) ? (idiomaParam as Idioma) : idiomas[0];
  const bilingue = idiomas.length > 1;
  const doIdiomaAtual = (i: string | null | undefined) => !i || i === idioma;
  const aulas = (todasAulas ?? []).filter((a) => doIdiomaAtual(a.idioma));
  const etapas = (todasEtapas ?? []).filter((e) => doIdiomaAtual(e.idioma));
  const checkpoints = (todosCheckpoints ?? []).filter((c) => doIdiomaAtual(c.idioma));
  const tarefas = (todasTarefas ?? []).filter((t) => doIdiomaAtual(t.idioma));
  const q = (extra: string) => `?${extra}${bilingue ? `&idioma=${idioma}` : ""}`;

  const hoje = diaISO(new Date());
  const agora = new Date().toISOString();
  const aulaHoje =
    aulas.find((a) => a.status === "agendada" && a.data && diaISO(a.data) === hoje) ?? null;
  const proximas = aulas.filter((a) => a.status === "agendada" && a.data && a.data >= agora).reverse();
  const realizadas = aulas.filter((a) => a.status !== "agendada");

  const competencias = lerCompetencias(cfg?.valor);
  const ultimo = checkpoints[0];
  const entregaDe = new Map((entregas ?? []).map((e) => [e.tarefa_id, e]));
  const audios = new Map<string, string>();
  await Promise.all(
    (entregas ?? [])
      .filter((e) => e.arquivo_path)
      .map(async (e) => {
        const { data } = await supabase.storage.from("entregas").createSignedUrl(e.arquivo_path!, 3600);
        if (data?.signedUrl) audios.set(e.tarefa_id, data.signedUrl);
      })
  );

  const nome = aluno.nome || aluno.email;
  const primeiroNome = nome.split(" ")[0];
  const iniciais = nome.split(" ").filter(Boolean).slice(0, 2).map((p: string) => p[0]?.toUpperCase()).join("");
  const nomeProf = professor ? professor.nome || professor.email : eu?.role === "admin" ? eu.nome || "você" : "—";
  const ehAdmin = eu?.role === "admin";

  const abas = [
    { chave: "aulas", label: "Aulas e tarefas" },
    { chave: "plano", label: "Plano" },
    { chave: "evolucao", label: "Evolução" },
    { chave: "glossario", label: "Glossário" },
    { chave: "dados", label: "Dados do aluno" },
  ];

  const linha = [
    programas.map((p) => `${p.nome} · ${rotuloIdioma(p.idioma)}`).join(", ") || "Sem programa",
    aluno.plano_nome,
    aluno.horario,
    `professor(a) ${nomeProf}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div key={id} className="flex flex-col gap-6">
      <Link href="/admin/alunos" className="text-sm text-[var(--text-secondary)]">
        ← Todos os alunos
      </Link>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-6 flex flex-wrap gap-6 items-center">
        <span className="w-[72px] h-[72px] rounded-full bg-[var(--navy)] text-[var(--gold-light)] font-serif text-[30px] font-semibold flex items-center justify-center">
          {iniciais}
        </span>
        <div className="flex-[1_1_280px] flex flex-col gap-1.5">
          <h1 className="m-0 font-serif font-semibold text-[36px] leading-[1.05]">{nome}</h1>
          <span className="text-sm text-[var(--text-secondary)]">{linha}</span>
          {aluno.objetivo ? (
            <span className="text-sm">
              <b className="font-semibold">Objetivo:</b> {aluno.objetivo}
            </span>
          ) : (
            <Link href={`/admin/alunos/${id}${q("aba=dados")}`} className="text-sm font-semibold text-[var(--gold-text)]">
              Definir o objetivo do aluno →
            </Link>
          )}
        </div>
        {(
          <Link
            href={`/previa/${id}`}
            className="h-11 px-[18px] rounded-xl border border-[var(--accent)] font-semibold text-sm flex items-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Ver como aluno
          </Link>
        )}
      </div>

      {bilingue && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-[var(--text-secondary)]">Estuda dois idiomas. Você está vendo:</span>
          <div role="group" aria-label="Idioma" className="flex bg-[var(--surface-3)] rounded-full p-1 gap-1">
            {idiomas.map((i) => (
              <Link
                key={i}
                href={`/admin/alunos/${id}?aba=${aba}&idioma=${i}`}
                aria-current={i === idioma ? "page" : undefined}
                className={`h-9 px-4 rounded-full text-[13px] font-semibold flex items-center ${
                  i === idioma ? "bg-[var(--navy)] text-[var(--gold-light)]" : "text-[var(--text-secondary)]"
                }`}
              >
                {ROTULO_IDIOMA[i]}
              </Link>
            ))}
          </div>
        </div>
      )}

      <nav aria-label="Seções do aluno" className="flex gap-1.5 border-b border-[var(--border-strong)] flex-wrap">
        {abas.map((a) => {
          const on = aba === a.chave;
          return (
            <Link
              key={a.chave}
              href={`/admin/alunos/${id}${q(`aba=${a.chave}`)}`}
              aria-current={on ? "page" : undefined}
              className={`h-[46px] px-[18px] flex items-center text-[15px] -mb-px border-b-2 ${
                on ? "font-semibold border-[var(--gold)]" : "text-[var(--text-secondary)] font-medium border-transparent"
              }`}
            >
              {a.label}
            </Link>
          );
        })}
      </nav>

      {aba === "aulas" && (
        <div className="grid gap-5 items-start [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
          <div className="flex flex-col gap-5">
            <RegistrarAulaForm alunoId={id} primeiroNome={primeiroNome} aulaHoje={aulaHoje ? { id: aulaHoje.id, tema: aulaHoje.tema } : null} idioma={idioma} />

            <form action={agendarAula} className={card}>
              <h2 className={h2}>Agendar próxima aula</h2>
              <input type="hidden" name="aluno_id" value={id} />
              <input type="hidden" name="idioma" value={idioma} />
              <div className="flex flex-wrap gap-2">
                <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
                  Data e hora
                  <input type="datetime-local" name="data" required className={campo} />
                </label>
                <label className="flex-1 min-w-[200px] flex flex-col gap-1.5 text-[13px] font-semibold">
                  Tema
                  <input name="tema" required placeholder="Ex.: Fechar uma reunião" className={campo} />
                </label>
              </div>
              <input name="descricao" placeholder="Descrição curta (opcional)" aria-label="Descrição" className={campo} />
              <div>
                <SubmitButton className={botao} pendingText="Agendando..." savedText="✓ Agendada">
                  Agendar
                </SubmitButton>
              </div>
              {proximas.length > 0 && (
                <ul className="m-0 p-0 list-none flex flex-col">
                  {proximas.map((a) => (
                    <li key={a.id} className="flex flex-col gap-2 py-2.5 border-t border-[var(--border-soft)]">
                      <div className="flex items-center gap-3">
                        <span className="flex-1 flex flex-col">
                          <span className="text-[15px] font-semibold">{a.tema}</span>
                          <span className="text-[13px] text-[var(--text-secondary)]">{quandoCompleto(a.data!)}</span>
                        </span>
                        <form action={excluirAula}>
                          <input type="hidden" name="aluno_id" value={id} />
                          <input type="hidden" name="id" value={a.id} />
                          <button type="submit" className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]">
                            Cancelar
                          </button>
                        </form>
                      </div>
                      <PreviaForm aulaId={a.id} data={a.data} previa={a.previa} voltar={`/admin/alunos/${id}`} />
                    </li>
                  ))}
                </ul>
              )}
            </form>
          </div>

          <div className="flex flex-col gap-5">
            <section className={card}>
              <h2 className={h2}>Tarefas e entregas</h2>
              {tarefas.length ? (
                tarefas.map((t) => {
                  const e = entregaDe.get(t.id);
                  const audio = audios.get(t.id);
                  return (
                    <div key={t.id} className="py-3 border-b border-[var(--border-soft)] flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex flex-col gap-0.5">
                          <span className="text-[15px] font-semibold">{t.texto}</span>
                          <span className="text-xs text-[var(--text-secondary)]">
                            {ENTREGA_ROTULO[t.entrega]}
                            {t.prazo ? ` · até ${diaCurtoComMes(t.prazo)}` : ""}
                          </span>
                        </span>
                        <span
                          className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-[10px]"
                          style={
                            e?.concluida
                              ? { background: "var(--success-bg)", color: "var(--success-text)" }
                              : { background: "var(--warning-bg)", color: "var(--warning-text)" }
                          }
                        >
                          {e?.concluida ? "Entregue" : "Pendente"}
                        </span>
                      </div>
                      {e?.resposta && <p className="m-0 text-sm bg-[var(--surface-2)] rounded-lg p-3 whitespace-pre-line">{e.resposta}</p>}
                      {audio && <audio controls src={audio} className="w-full" />}
                      {e?.concluida && (
                        <form action={comentarEntrega} className="flex gap-2">
                          <input type="hidden" name="aluno_id" value={id} />
                          <input type="hidden" name="tarefa_id" value={t.id} />
                          <input name="comentario" defaultValue={e.comentario ?? ""} placeholder="Comentário para o aluno" aria-label="Comentário" className={`${campo} flex-1`} />
                          <SubmitButton className={botaoLinha}>Salvar</SubmitButton>
                        </form>
                      )}
                      <form action={excluirTarefa}>
                        <input type="hidden" name="aluno_id" value={id} />
                        <input type="hidden" name="id" value={t.id} />
                        <button type="submit" className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]">
                          Excluir tarefa
                        </button>
                      </form>
                    </div>
                  );
                })
              ) : (
                <p className="m-0 text-sm text-[var(--text-secondary)]">Nenhuma tarefa ainda.</p>
              )}
              <form action={criarTarefa} className="flex flex-col gap-2 pt-2">
                <input type="hidden" name="aluno_id" value={id} />
                <input type="hidden" name="idioma" value={idioma} />
                <input name="texto" required placeholder="Nova tarefa avulsa" aria-label="Nova tarefa" className={campo} />
                <div className="flex flex-wrap gap-2">
                  <select name="entrega" defaultValue="feito" aria-label="Como entrega" className={campo}>
                    <option value="feito">Marcar como feita</option>
                    <option value="texto">Texto</option>
                    <option value="audio">Áudio</option>
                    <option value="link">Link externo</option>
                  </select>
                  <input name="prazo" type="date" aria-label="Prazo" className={campo} />
                  <input name="link_url" type="url" placeholder="Link (se for externo)" aria-label="Link" className={`${campo} flex-1 min-w-[160px]`} />
                </div>
                <div>
                  <SubmitButton className={botaoLinha} pendingText="Adicionando..." savedText="✓ Adicionada">
                    Adicionar tarefa
                  </SubmitButton>
                </div>
              </form>
            </section>

            <section className={card}>
              <h2 className={h2}>Aulas anteriores</h2>
              {realizadas.length ? (
                realizadas.map((a) => (
                  <div key={a.id} className="py-3 border-b border-[var(--border-soft)] flex flex-col gap-1">
                    <span className="flex justify-between gap-3 text-[15px] font-semibold">
                      <span>{a.tema}</span>
                      <span className="text-[13px] font-normal text-[var(--text-secondary)]">
                        {a.data ? diaCurtoComMes(diaISO(a.data)) : ""}
                      </span>
                    </span>
                    {a.resumo && <span className="text-[13px] text-[var(--text-secondary)]">{a.resumo}</span>}
                  </div>
                ))
              ) : (
                <p className="m-0 text-sm text-[var(--text-secondary)]">Nenhuma aula registrada ainda.</p>
              )}
            </section>
          </div>
        </div>
      )}

      {aba === "plano" && (
        <section className={card}>
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <h2 className={h2}>Plano do semestre</h2>
            {programas.length > 0 && (
              <form action={aplicarModelo} className="flex gap-2 items-center">
                <input type="hidden" name="aluno_id" value={id} />
                <input type="hidden" name="idioma" value={idioma} />
                <select name="turma_id" aria-label="Modelo" className={campo}>
                  {programas.map((p) => (
                    <option key={p.id} value={p.id}>
                      Modelo: {p.nome}
                    </option>
                  ))}
                </select>
                <SubmitButton className={botaoLinha} pendingText="Aplicando..." savedText="✓ Aplicado">
                  Usar modelo
                </SubmitButton>
              </form>
            )}
          </div>
          {etapas.map((e) => (
            <form key={e.id} action={salvarEtapa} className="grid gap-2.5 items-center py-2.5 border-b border-[var(--border-soft)] [grid-template-columns:minmax(110px,140px)_minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
              <input type="hidden" name="aluno_id" value={id} />
              <input type="hidden" name="id" value={e.id} />
              <input name="periodo" defaultValue={e.periodo} aria-label="Período" className={`${campo} font-semibold`} />
              <input name="tema" defaultValue={e.tema} aria-label="Tema" className={campo} />
              <input name="entrega" defaultValue={e.entrega ?? ""} placeholder="Entrega real" aria-label="Entrega real" className={campo} />
              <SubmitButton className={botaoLinha}>Salvar</SubmitButton>
              <button formAction={excluirEtapa} className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]">
                Excluir
              </button>
            </form>
          ))}
          <form action={salvarEtapa} className="grid gap-2.5 items-center pt-2 [grid-template-columns:minmax(110px,140px)_minmax(0,1fr)_minmax(0,1fr)_auto]">
            <input type="hidden" name="aluno_id" value={id} />
            <input type="hidden" name="idioma" value={idioma} />
            <input name="periodo" required placeholder="Ex.: Janeiro" aria-label="Período" className={campo} />
            <input name="tema" required placeholder="Tema" aria-label="Tema" className={campo} />
            <input name="entrega" placeholder="Entrega real" aria-label="Entrega real" className={campo} />
            <SubmitButton className={botao} pendingText="..." savedText="✓">
              Adicionar
            </SubmitButton>
          </form>
        </section>
      )}

      {aba === "evolucao" && (
        <div className="grid gap-5 items-start [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
          <CheckpointForm
            alunoId={id}
            competencias={competencias}
            iniciais={(ultimo?.niveis ?? {}) as Record<string, number>}
            numero={checkpoints.length + 1}
            idioma={idioma}
          />
          <section className={card}>
            <h2 className={h2}>Histórico</h2>
            {checkpoints.length ? (
              checkpoints.map((c) => {
                const n = (c.niveis ?? {}) as Record<string, number>;
                return (
                  <div key={c.id} className="py-3 border-b border-[var(--border-soft)] flex flex-col gap-1.5">
                    <span className="flex justify-between text-[15px] font-semibold">
                      <span>{c.titulo || "Checkpoint"}</span>
                      <span className="text-[13px] font-normal text-[var(--text-secondary)]">{diaCurtoComMes(c.data)}</span>
                    </span>
                    <span className="text-[13px] text-[var(--text-secondary)]">
                      {Object.entries(n)
                        .map(([k, v]) => `${k}: ${nivel(v)?.rotulo ?? "—"}`)
                        .join(" · ")}
                    </span>
                    {c.comentario && <span className="text-[13px]">{c.comentario}</span>}
                  </div>
                );
              })
            ) : (
              <p className="m-0 text-sm text-[var(--text-secondary)]">Nenhum checkpoint ainda. O primeiro funciona como diagnóstico.</p>
            )}
          </section>
          <CertificadosAluno
            alunoId={id}
            nome={aluno.nome || aluno.email}
            programaSugerido={programas[0]?.nome ?? ""}
            podeEmitir={eu?.role === "admin"}
          />
        </div>
      )}

      {aba === "glossario" && (
        <div className="grid gap-5 items-start [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
          <section className={card}>
            <h2 className={h2}>Glossário de {primeiroNome}</h2>
            <p className="m-0 text-sm text-[var(--text-secondary)]">
              Termos exclusivos: só {primeiroNome} vê, junto com os glossários gerais.
            </p>
            <GlossarioForm categoria={null} alunoId={id} />
            <GlossarioImportForm categoria={null} alunoId={id} />
          </section>
          <section className={card}>
            <h2 className={h2}>Termos ({(termosAluno ?? []).filter((t) => !t.idioma || t.idioma === idioma || t.idioma === "espanhol_ingles").length})</h2>
            {(termosAluno ?? []).length ? (
              <ul className="m-0 p-0 list-none divide-y divide-[var(--border)] border border-[var(--border)] rounded-xl">
                {(termosAluno ?? [])
                  .filter((t) => !t.idioma || t.idioma === idioma || t.idioma === "espanhol_ingles")
                  .map((t) => (
                    <GlossarioTermoRow key={t.id} termo={t} categorias={[]} />
                  ))}
              </ul>
            ) : (
              <p className="m-0 text-sm text-[var(--text-secondary)]">Nenhum termo exclusivo ainda.</p>
            )}
          </section>
        </div>
      )}

      {aba === "dados" && (
        <form action={salvarDadosAluno} className={`${card} max-w-2xl`}>
          <h2 className={h2}>Dados do aluno</h2>
          <input type="hidden" name="aluno_id" value={id} />
          {[
            { n: "objetivo", l: "Objetivo", v: aluno.objetivo, p: "Ex.: conduzir as reuniões com o time do México" },
            { n: "foco", l: "Foco do mês", v: aluno.foco, p: "Ex.: abrir e fechar reuniões" },
            { n: "horario", l: "Dia e horário das aulas", v: aluno.horario, p: "Ex.: quartas, 18h" },
            { n: "plano_nome", l: "Plano", v: aluno.plano_nome, p: "Ex.: plano semestral" },
            { n: "link_aula", l: "Link da sala de aula", v: aluno.link_aula, p: "https://meet.google.com/..." },
          ].map((c) => (
            <label key={c.n} className="flex flex-col gap-1.5 text-[13px] font-semibold">
              {c.l}
              <input name={c.n} defaultValue={c.v ?? ""} placeholder={c.p} className={campo} />
            </label>
          ))}
          <div>
            <SubmitButton className={botao} pendingText="Salvando..." savedText="✓ Salvo">
              Salvar dados
            </SubmitButton>
          </div>
          {ehAdmin && (
            <p className="m-0 text-[13px] text-[var(--text-secondary)]">
              Programas e professor responsável ficam em{" "}
              <Link href="/admin/alunos" className="font-semibold text-[var(--gold-text)]">
                Pessoas
              </Link>
              .
            </p>
          )}
        </form>
      )}
    </div>
  );
}
