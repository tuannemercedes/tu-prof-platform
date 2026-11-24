import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { contratoAtual, dataCurta, frequencia, getEmpresas, moeda, type AulaGrupo, type Grupo } from "@/lib/empresas";
import { diaISO, quandoCompleto } from "@/lib/datas";
import { IDIOMAS, rotuloIdioma } from "@/lib/programas";
import SubmitButton from "@/components/submit-button";
import ParticipantesForm from "@/components/participantes-form";
import ConfirmarExclusao from "@/components/confirmar-exclusao";
import PreviaForm from "@/components/previa-form";
import { emitirCertificadosGrupo } from "@/app/certificado-actions";
import { lerPrevia } from "@/lib/previa";
import {
  agendarAulaGrupo,
  criarGrupo,
  excluirAulaGrupo,
  excluirContrato,
  excluirEmpresa,
  excluirGrupo,
  registrarAulaGrupo,
  removerParticipante,
  salvarContrato,
  salvarEmpresa,
  salvarGrupo,
} from "../actions";

const campo = "h-[42px] rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[15px] font-normal";
const rotulo = "flex flex-col gap-1.5 text-[13px] font-semibold";
const botao = "h-11 px-[18px] rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-sm whitespace-nowrap";
const botaoLinha = "h-10 px-3.5 rounded-xl border border-[var(--border-strong)] text-sm font-medium hover:bg-[var(--surface-2)] whitespace-nowrap";
const cartao = "bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-5";

const ABAS = [
  { v: "grupos", l: "Grupos e aulas" },
  { v: "contrato", l: "Contrato" },
  { v: "dados", l: "Dados da empresa" },
];

function Aula({ aula, grupo, empresaId }: { aula: AulaGrupo; grupo: Grupo; empresaId: string }) {
  const feita = aula.status === "realizada";
  const presentes = new Set(aula.presentes);
  return (
    <details className="group rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <summary className="list-none cursor-pointer flex items-center gap-3 p-3">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${feita ? "bg-[var(--gold)]" : "border border-[var(--border-strong)]"}`}
          aria-hidden="true"
        />
        <span className="flex-1 min-w-0 flex flex-col">
          <span className="text-sm font-semibold truncate">{aula.tema}</span>
          <span className="text-xs text-[var(--text-secondary)]">
            {aula.data ? quandoCompleto(aula.data) : "Sem data"}
            {lerPrevia(aula.previa) ? " · com prévia" : ""}
            {feita
              ? aula.temChamada
                ? ` · ${aula.presentes.length} de ${grupo.participantes.length} presentes`
                : " · sem chamada"
              : " · agendada"}
          </span>
        </span>
        <span className="text-xs font-semibold text-[var(--gold-text)] group-open:hidden">{feita ? "Ver" : "Registrar"}</span>
      </summary>
      <div className="border-t border-[var(--border-soft)] p-3.5 flex flex-col gap-3">
        <PreviaForm
          aulaId={aula.id}
          data={aula.data}
          previa={aula.previa}
          voltar={`/admin/empresas/${empresaId}`}
          vistas={aula.vistas.length}
          total={grupo.participantes.length}
        />
        <form action={registrarAulaGrupo} className="flex flex-col gap-3">
          <input type="hidden" name="aula_id" value={aula.id} />
          <input type="hidden" name="turma_id" value={grupo.id} />
          <input type="hidden" name="empresa_id" value={empresaId} />
          <label className={rotulo}>
            Tema
            <input name="tema" defaultValue={aula.tema} className={campo} />
          </label>
          <label className={rotulo}>
            O que trabalhamos
            <textarea
              name="resumo"
              rows={2}
              defaultValue={aula.resumo ?? ""}
              placeholder="Resumo curto: entra no relatório do RH"
              className="rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2.5 text-sm font-normal"
            />
          </label>
          {grupo.participantes.length > 0 && (
            <fieldset className="flex flex-col gap-1.5">
              <legend className="text-[13px] font-semibold mb-1.5">Presença (desmarque quem faltou)</legend>
              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1">
                {grupo.participantes.map((p) => (
                  <label key={p.id} className="flex items-center gap-2.5 min-h-9 text-sm">
                    <input
                      type="checkbox"
                      name="presente"
                      value={p.id}
                      defaultChecked={aula.temChamada ? presentes.has(p.id) : true}
                      className="w-[18px] h-[18px] accent-[var(--navy)]"
                    />
                    {p.nome}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <div className="flex gap-2 flex-wrap">
            <SubmitButton className={botao} pendingText="Salvando..." savedText="✓ Salvo">
              {feita ? "Salvar alterações" : "Registrar aula"}
            </SubmitButton>
          </div>
        </form>
        <form action={excluirAulaGrupo}>
          <input type="hidden" name="aula_id" value={aula.id} />
          <input type="hidden" name="empresa_id" value={empresaId} />
          <ConfirmarExclusao rotulo="Excluir aula" aviso="Apaga a aula e a presença registrada nela." />
        </form>
      </div>
    </details>
  );
}

export default async function EmpresaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aba?: string }>;
}) {
  const [{ id }, { aba = "grupos" }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const [[empresa], { data: equipe }] = await Promise.all([
    getEmpresas(supabase, id),
    supabase.from("profiles").select("id, nome, email, role").in("role", ["admin", "professor"]).order("nome"),
  ]);
  if (!empresa) notFound();
  const { data: certs } = await supabase
    .from("certificados")
    .select("turma_id, aluno_id")
    .in("turma_id", empresa.grupos.map((g) => g.id).concat("00000000-0000-0000-0000-000000000000"));

  const hoje = diaISO(new Date());
  const c = contratoAtual(empresa.contratos);
  const pessoas = empresa.grupos.reduce((s, g) => s + g.participantes.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link href="/admin/empresas" className="text-sm font-semibold text-[var(--gold-text)]">
          ← Empresas
        </Link>
        <div className="flex flex-wrap gap-4 items-end justify-between">
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 font-serif font-semibold text-[40px] leading-[1.05]">{empresa.nome}</h1>
            <p className="m-0 text-[15px] text-[var(--text-secondary)]">
              {c ? `${c.descricao ?? "Contrato"} · ${rotuloIdioma(c.idioma)} · ${moeda(c.valor_mensal)}/mês` : "Sem contrato cadastrado"}
              {c?.max_acessos ? ` · ${pessoas} de ${c.max_acessos} acessos` : ` · ${pessoas} participantes`}
              {empresa.contato_nome ? ` · RH: ${empresa.contato_nome}` : ""}
            </p>
            {c?.max_acessos && pessoas > c.max_acessos ? (
              <p className="m-0 text-sm font-semibold text-[var(--danger-text)]">
                {pessoas - c.max_acessos} {pessoas - c.max_acessos === 1 ? "pessoa" : "pessoas"} acima do contratado. Vale falar com o RH sobre ajuste.
              </p>
            ) : null}
          </div>
          <Link href={`/relatorio/empresa/${empresa.id}`} className={`${botao} flex items-center`}>
            Relatório para o RH
          </Link>
        </div>
      </div>

      <nav aria-label="Seções da empresa" className="flex gap-1.5 border-b border-[var(--border)]">
        {ABAS.map((a) => (
          <Link
            key={a.v}
            href={`/admin/empresas/${id}?aba=${a.v}`}
            aria-current={aba === a.v ? "page" : undefined}
            className={`px-3.5 h-11 flex items-center text-sm border-b-2 -mb-px ${
              aba === a.v ? "border-[var(--gold)] font-semibold" : "border-transparent text-[var(--text-secondary)]"
            }`}
          >
            {a.l}
          </Link>
        ))}
      </nav>

      {aba === "grupos" && (
        <div className="flex flex-col gap-5">
          {empresa.grupos.map((g) => {
            const proximas = g.aulas.filter((a) => a.status !== "realizada" && (!a.data || diaISO(a.data) >= hoje));
            const pendentes = g.aulas.filter((a) => a.status !== "realizada" && a.data && diaISO(a.data) < hoje);
            const feitas = g.aulas.filter((a) => a.status === "realizada").reverse();
            const freq = frequencia(g.aulas) as { media: number; aulas: number } | null;
            return (
              <section key={g.id} className={`${cartao} flex flex-col gap-4`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <h2 className="m-0 font-serif font-semibold text-[26px] leading-tight">{g.nome}</h2>
                    <span className="text-[13px] text-[var(--text-secondary)]">
                      {rotuloIdioma(g.idioma)} · {g.participantes.length} participantes
                      {freq ? ` · média de ${freq.media} presentes em ${freq.aulas} ${freq.aulas === 1 ? "aula" : "aulas"}` : ""}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Link href={`/admin/turmas?p=${g.id}`} className={`${botaoLinha} flex items-center`}>
                      Trilha e materiais →
                    </Link>
                  </div>
                </div>

                <details className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
                  <summary className="list-none cursor-pointer px-3.5 h-11 flex items-center text-sm font-semibold">
                    ✎ Editar ou excluir grupo
                  </summary>
                  <div className="px-3.5 pb-3.5 flex flex-col gap-3.5">
                    <form action={salvarGrupo} className="flex flex-wrap gap-2.5 items-end">
                      <input type="hidden" name="id" value={g.id} />
                      <input type="hidden" name="empresa_id" value={empresa.id} />
                      <label className={`${rotulo} flex-1 min-w-[200px]`}>
                        Nome do grupo
                        <input name="nome" required defaultValue={g.nome} className={campo} />
                      </label>
                      <label className={rotulo}>
                        Idioma
                        <select name="idioma" defaultValue={g.idioma} className={campo}>
                          {IDIOMAS.map((i) => (
                            <option key={i.valor} value={i.valor}>
                              {i.rotulo}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className={rotulo}>
                        Quem conduz
                        <select name="professor_id" defaultValue={g.professorId ?? ""} className={campo}>
                          <option value="">Você</option>
                          {(equipe ?? [])
                            .filter((p) => p.role === "professor")
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.nome || p.email}
                              </option>
                            ))}
                        </select>
                      </label>
                      <SubmitButton className={botao}>Salvar</SubmitButton>
                    </form>
                    <form action={excluirGrupo}>
                      <input type="hidden" name="id" value={g.id} />
                      <input type="hidden" name="empresa_id" value={empresa.id} />
                      <ConfirmarExclusao
                        rotulo="Excluir grupo"
                        aviso={`Isso apaga o grupo "${g.nome}" com ${g.aulas.length} ${g.aulas.length === 1 ? "aula" : "aulas"} e a presença registrada. As ${g.participantes.length} pessoas continuam com acesso à plataforma, só saem do grupo.`}
                        confirmar="Sim, excluir grupo"
                      />
                    </form>
                  </div>
                </details>

                {(() => {
                  const realizadas = g.aulas.filter((a) => a.status === "realizada" && a.data);
                  const comCert = new Set((certs ?? []).filter((x) => x.turma_id === g.id).map((x) => x.aluno_id));
                  return (
                    <details className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
                      <summary className="list-none cursor-pointer px-3.5 min-h-11 py-2 flex flex-wrap items-center gap-x-2 text-sm font-semibold">
                        🎓 Certificados do grupo
                        <span className="text-xs font-normal text-[var(--text-secondary)]">
                          {comCert.size} de {g.participantes.length} emitidos
                        </span>
                      </summary>
                      <form action={emitirCertificadosGrupo} className="px-3.5 pb-3.5 flex flex-col gap-3">
                        <input type="hidden" name="empresa_id" value={empresa.id} />
                        <input type="hidden" name="turma_id" value={g.id} />
                        <p className="m-0 text-[13px] text-[var(--text-secondary)]">
                          Emite o certificado de participação para quem atingiu a frequência mínima. Quem já tem não recebe de novo.
                          Cada pessoa abre o seu na Evolução, e o certificado tem um código que o RH pode conferir.
                        </p>
                        <label className={rotulo}>
                          Programa
                          <input name="titulo" required defaultValue={c?.descricao ?? g.nome} className={campo} />
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <label className={rotulo}>
                            Início
                            <input name="inicio" type="date" defaultValue={realizadas[0]?.data ? diaISO(realizadas[0].data) : ""} className={campo} />
                          </label>
                          <label className={rotulo}>
                            Fim
                            <input
                              name="fim"
                              type="date"
                              defaultValue={realizadas.length ? diaISO(realizadas[realizadas.length - 1].data!) : ""}
                              className={campo}
                            />
                          </label>
                          <label className={rotulo}>
                            Horas
                            <input name="carga_horaria" type="number" min={1} defaultValue={realizadas.length || ""} className={campo} />
                          </label>
                          <label className={rotulo}>
                            Frequência mínima
                            <select name="minimo" defaultValue="75" className={campo}>
                              <option value="0">Todos</option>
                              <option value="50">50%</option>
                              <option value="75">75%</option>
                              <option value="85">85%</option>
                            </select>
                          </label>
                        </div>
                        <SubmitButton className={`${botao} self-start`} pendingText="Emitindo..." savedText="✓ Emitidos">
                          Emitir certificados
                        </SubmitButton>
                      </form>
                    </details>
                  );
                })()}

                <div className="grid gap-5 lg:grid-cols-2 items-start">
                  <div className="flex flex-col gap-2.5">
                    <span className="text-xs tracking-[0.1em] uppercase text-[var(--text-secondary)] font-semibold">Participantes</span>
                    {g.participantes.length ? (
                      <ul className="m-0 p-0 list-none divide-y divide-[var(--border-soft)] border border-[var(--border)] rounded-xl">
                        {g.participantes.map((p) => {
                          const f = frequencia(g.aulas, p.id) as { foi: number; de: number; pct: number } | null;
                          return (
                            <li key={p.id} className="flex items-center gap-3 px-3 py-2">
                              <Link href={`/admin/alunos/${p.id}`} className="flex-1 min-w-0 flex flex-col">
                                <span className="text-sm font-semibold truncate">
                                  {p.nome}
                                  {(certs ?? []).some((x) => x.turma_id === g.id && x.aluno_id === p.id) && (
                                    <span title="Certificado emitido" className="ml-1.5">🎓</span>
                                  )}
                                </span>
                                <span className="text-xs text-[var(--text-secondary)] truncate">{p.email}</span>
                              </Link>
                              <span
                                className={`text-xs font-semibold ${
                                  f && f.pct < 60 ? "text-[var(--danger-text)]" : "text-[var(--text-secondary)]"
                                }`}
                                title="Frequência nas aulas com chamada"
                              >
                                {f ? `${f.pct}%` : "—"}
                              </span>
                              <form action={removerParticipante}>
                                <input type="hidden" name="turma_id" value={g.id} />
                                <input type="hidden" name="aluno_id" value={p.id} />
                                <input type="hidden" name="empresa_id" value={empresa.id} />
                                <button type="submit" aria-label={`Tirar ${p.nome} do grupo`} className="text-[var(--text-secondary)] text-lg px-1">
                                  ×
                                </button>
                              </form>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="m-0 text-sm text-[var(--text-secondary)]">Ninguém no grupo ainda.</p>
                    )}
                    <ParticipantesForm empresaId={empresa.id} turmaId={g.id} />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <span className="text-xs tracking-[0.1em] uppercase text-[var(--text-secondary)] font-semibold">Aulas</span>
                    <form action={agendarAulaGrupo} className="flex flex-wrap gap-2 items-end">
                      <input type="hidden" name="turma_id" value={g.id} />
                      <input type="hidden" name="empresa_id" value={empresa.id} />
                      <input name="data" type="datetime-local" required aria-label="Data e hora" className={campo} />
                      <input name="tema" required placeholder="Tema da aula" aria-label="Tema da aula" className={`${campo} flex-1 min-w-[160px]`} />
                      <select name="semanas" defaultValue="1" aria-label="Repetir" className={campo}>
                        <option value="1">Só esta</option>
                        <option value="4">Toda semana · 4</option>
                        <option value="8">Toda semana · 8</option>
                        <option value="12">Toda semana · 12</option>
                      </select>
                      <SubmitButton className={botaoLinha} pendingText="..." savedText="✓ Agendada">
                        Agendar
                      </SubmitButton>
                    </form>
                    {pendentes.length > 0 && (
                      <p className="m-0 text-[13px] font-semibold text-[var(--warning-text)]">
                        {pendentes.length} {pendentes.length === 1 ? "aula já passou e falta" : "aulas já passaram e faltam"} registrar
                      </p>
                    )}
                    {[...pendentes, ...proximas, ...feitas.slice(0, 8)].map((a) => (
                      <Aula key={a.id} aula={a} grupo={g} empresaId={empresa.id} />
                    ))}
                    {!g.aulas.length && <p className="m-0 text-sm text-[var(--text-secondary)]">Nenhuma aula ainda.</p>}
                  </div>
                </div>
              </section>
            );
          })}

          <form action={criarGrupo} className={`${cartao} flex flex-wrap gap-2 items-end`}>
            <input type="hidden" name="empresa_id" value={empresa.id} />
            <label className={`${rotulo} flex-1 min-w-[200px]`}>
              Novo grupo
              <input name="nome" required placeholder={`Ex.: ${empresa.nome} · Espanhol · Grupo 1`} className={campo} />
            </label>
            <label className={rotulo}>
              Idioma
              <select name="idioma" defaultValue={c?.idioma === "ingles" ? "ingles" : "espanhol"} className={campo}>
                {IDIOMAS.map((i) => (
                  <option key={i.valor} value={i.valor}>
                    {i.rotulo}
                  </option>
                ))}
              </select>
            </label>
            <SubmitButton className={botao} pendingText="Criando..." savedText="✓ Criado">
              Criar grupo
            </SubmitButton>
          </form>
        </div>
      )}

      {aba === "contrato" && (
        <div className="flex flex-col gap-4 max-w-3xl">
          {[...empresa.contratos]
            .sort((a, b) => ((a.inicio ?? "") < (b.inicio ?? "") ? 1 : -1))
            .map((k) => (
              <details key={k.id} className={cartao} open={k.id === c?.id}>
                <summary className="list-none cursor-pointer flex flex-wrap justify-between gap-2">
                  <span className="font-semibold">
                    {k.descricao ?? "Contrato"} · {rotuloIdioma(k.idioma)}
                    {k.id === c?.id && <span className="ml-2 text-xs text-[var(--success-text)]">vigente</span>}
                  </span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {moeda(k.valor_mensal)}/mês · {dataCurta(k.inicio)} a {dataCurta(k.fim)}
                  </span>
                </summary>
                <div className="pt-4 flex flex-col gap-3">
                  <ContratoForm empresaId={empresa.id} contrato={k} />
                  <form action={excluirContrato}>
                    <input type="hidden" name="id" value={k.id} />
                    <input type="hidden" name="empresa_id" value={empresa.id} />
                    <ConfirmarExclusao rotulo="Excluir contrato" aviso="Apaga este contrato. Grupos e aulas continuam." />
                  </form>
                </div>
              </details>
            ))}
          <div className={cartao}>
            <h2 className="mt-0 mb-3 font-serif font-semibold text-2xl">{empresa.contratos.length ? "Novo contrato ou renovação" : "Cadastrar contrato"}</h2>
            <ContratoForm empresaId={empresa.id} />
          </div>
        </div>
      )}

      {aba === "dados" && (
        <form action={salvarEmpresa} className={`${cartao} flex flex-col gap-3.5 max-w-2xl`}>
          <input type="hidden" name="id" value={empresa.id} />
          <label className={rotulo}>
            Nome da empresa
            <input name="nome" defaultValue={empresa.nome} required className={campo} />
          </label>
          <div className="grid sm:grid-cols-2 gap-3.5">
            <label className={rotulo}>
              Contato no RH
              <input name="contato_nome" defaultValue={empresa.contato_nome ?? ""} className={campo} />
            </label>
            <label className={rotulo}>
              E-mail do contato
              <input name="contato_email" type="email" defaultValue={empresa.contato_email ?? ""} className={campo} />
            </label>
            <label className={rotulo}>
              Telefone / WhatsApp
              <input name="contato_telefone" defaultValue={empresa.contato_telefone ?? ""} className={campo} />
            </label>
          </div>
          <label className={rotulo}>
            Anotações
            <textarea
              name="observacoes"
              rows={4}
              defaultValue={empresa.observacoes ?? ""}
              placeholder="Como a empresa gosta de se comunicar, decisões combinadas, próximos passos..."
              className="rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2.5 text-[15px] font-normal"
            />
          </label>
          <SubmitButton className={`${botao} self-start`}>Salvar</SubmitButton>
        </form>
      )}

      {aba === "dados" && (
        <form action={excluirEmpresa} className="max-w-2xl">
          <input type="hidden" name="id" value={empresa.id} />
          <ConfirmarExclusao
            rotulo="Excluir empresa"
            aviso={`Isso apaga ${empresa.nome} com contratos, grupos, aulas e presença. As pessoas continuam com acesso à plataforma.`}
            confirmar="Sim, excluir empresa"
          />
        </form>
      )}
    </div>
  );
}

function ContratoForm({
  empresaId,
  contrato,
}: {
  empresaId: string;
  contrato?: {
    id: string;
    descricao: string | null;
    idioma: string;
    valor_mensal: number | null;
    max_acessos: number | null;
    aulas_mes: number | null;
    inicio: string | null;
    fim: string | null;
    observacoes: string | null;
  };
}) {
  return (
    <form action={salvarContrato} className="flex flex-col gap-3.5">
      <input type="hidden" name="empresa_id" value={empresaId} />
      {contrato && <input type="hidden" name="id" value={contrato.id} />}
      <div className="grid sm:grid-cols-2 gap-3.5">
        <label className={rotulo}>
          Nome do programa
          <input name="descricao" defaultValue={contrato?.descricao ?? ""} placeholder="Ex.: Comunicação Internacional em Espanhol" className={campo} />
        </label>
        <label className={rotulo}>
          Idioma
          <select name="idioma" defaultValue={contrato?.idioma ?? "espanhol"} className={campo}>
            {IDIOMAS.map((i) => (
              <option key={i.valor} value={i.valor}>
                {i.rotulo}
              </option>
            ))}
          </select>
        </label>
        <label className={rotulo}>
          Valor mensal (R$)
          <input name="valor_mensal" inputMode="decimal" defaultValue={contrato?.valor_mensal ?? ""} placeholder="3200" className={campo} />
        </label>
        <label className={rotulo}>
          Acessos (pessoas)
          <input name="max_acessos" type="number" min={0} defaultValue={contrato?.max_acessos ?? ""} placeholder="30" className={campo} />
        </label>
        <label className={rotulo}>
          Aulas por mês (por grupo)
          <input name="aulas_mes" type="number" min={0} defaultValue={contrato?.aulas_mes ?? ""} placeholder="5" className={campo} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className={rotulo}>
            Início
            <input name="inicio" type="date" defaultValue={contrato?.inicio ?? ""} className={campo} />
          </label>
          <label className={rotulo}>
            Fim
            <input name="fim" type="date" defaultValue={contrato?.fim ?? ""} className={campo} />
          </label>
        </div>
      </div>
      <label className={rotulo}>
        Combinados
        <textarea
          name="observacoes"
          rows={3}
          defaultValue={contrato?.observacoes ?? ""}
          placeholder="Ex.: grupos de 10 a 12, aulas de 1h, desconto se fechar inglês + espanhol"
          className="rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2.5 text-[15px] font-normal"
        />
      </label>
      <SubmitButton className={`${botao} self-start`}>{contrato ? "Salvar contrato" : "Cadastrar contrato"}</SubmitButton>
    </form>
  );
}
