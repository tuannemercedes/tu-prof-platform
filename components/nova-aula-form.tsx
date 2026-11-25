"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { criarAula } from "@/app/(admin)/admin/(gestao)/aulas/actions";
import { detectarTipo } from "@/lib/links";

type Programa = { id: string; nome: string; idioma: string; alunos: number };
type Aluno = { id: string; nome: string; programa: string };

type Props = {
  programaInicial: string | null;
  programas: Programa[];
  materias: { id: string; titulo: string }[];
  modulos: { turma_id: string; materia_id: string; ordem: number }[];
  alunos: Aluno[];
};

const ENTREGAS = [
  { v: "feito", l: "Só marcar como feita", a: "O aluno marca a caixinha quando terminar." },
  { v: "texto", l: "Texto", a: "O aluno escreve a resposta na própria tarefa." },
  { v: "audio", l: "Áudio", a: "O aluno grava pelo celular e você ouve na ficha dele." },
  { v: "link", l: "Link externo", a: "Um botão leva à UZUS, a um Google Docs ou formulário. Depois ele volta e marca como feita." },
];

const campo = "h-[46px] rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[15px] font-normal";
const card = "bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-[22px] flex flex-col gap-4";
const pill = (on: boolean) =>
  `h-[38px] px-3.5 rounded-full text-[13px] font-medium border ${
    on ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]" : "bg-[var(--surface)] border-[var(--border-strong)]"
  }`;

export default function NovaAulaForm({ programaInicial, programas, materias, modulos, alunos }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  const modulosDoPrograma = programaInicial
    ? modulos.filter((m) => m.turma_id === programaInicial).map((m) => m.materia_id)
    : [];
  const opcoesModulo = modulosDoPrograma.length
    ? materias.filter((m) => modulosDoPrograma.includes(m.id))
    : materias;

  const [materiaId, setMateriaId] = useState(opcoesModulo[0]?.id ?? "");
  const [titulo, setTitulo] = useState("");
  const [link, setLink] = useState("");
  const [tarefa, setTarefa] = useState("");
  const [entrega, setEntrega] = useState("feito");
  const [linkTarefa, setLinkTarefa] = useState("");
  const [on, setOn] = useState<Record<string, boolean>>(programaInicial ? { [programaInicial]: true } : {});
  const [escolhidos, setEscolhidos] = useState<string[]>([]);
  const [busca, setBusca] = useState("");

  const det = detectarTipo(link);
  const programaBase = programas.find((p) => p.id === programaInicial) ?? programas.find((p) => on[p.id]);

  const resumo = useMemo(() => {
    const ligados = programas.filter((p) => on[p.id]);
    const extras = alunos.filter((a) => escolhidos.includes(a.id));
    const total = ligados.reduce((s, p) => s + p.alunos, 0) + extras.length;
    const partes: string[] = [];
    if (ligados.length) partes.push(`Todo o ${ligados.map((p) => p.nome).join(", ")}`);
    if (extras.length) partes.push(extras.map((a) => a.nome).join(" e "));
    const fora = programas.filter((p) => !on[p.id]).map((p) => p.nome);
    const texto =
      (partes.length ? partes.join(" + ") + "." : "Ninguém ainda.") +
      (fora.length ? ` Os demais alunos de ${fora.join(", ")} não veem.` : "");
    return { total, texto };
  }, [programas, alunos, on, escolhidos]);

  const sugestoes = alunos
    .filter((a) => !escolhidos.includes(a.id))
    .filter((a) => !busca.trim() || a.nome.toLowerCase().includes(busca.trim().toLowerCase()))
    .slice(0, 6);

  function publicar() {
    setErro(null);
    startTransition(async () => {
      const r = await criarAula({
        materiaId,
        titulo,
        link,
        idioma: programaBase?.idioma ?? "espanhol",
        turmaIds: programas.filter((p) => on[p.id]).map((p) => p.id),
        alunoIds: escolhidos,
        todos: false,
        tarefa: tarefa.trim() ? { texto: tarefa, entrega, linkUrl: linkTarefa } : null,
      });
      if (r?.error) setErro(r.error);
      else router.push(programaInicial ? `/admin/turmas?p=${programaInicial}` : "/admin/turmas");
    });
  }

  return (
    <div className="flex flex-wrap gap-5 items-start">
      <div className="flex-[999_1_460px] min-w-0 flex flex-col gap-5">
        <section className={card}>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
            Módulo
            <select value={materiaId} onChange={(e) => setMateriaId(e.target.value)} className={campo}>
              {opcoesModulo.length === 0 && <option value="">Crie um módulo primeiro</option>}
              {opcoesModulo.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.titulo}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
            Título da aula
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Negociar prazos sem perder a relação" className={campo} />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
            Vídeo ou material
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Cole o link (Bunny, YouTube, Spotify, página...)" className={campo} />
          </label>
          {link.trim() && (
            <div className="flex gap-3 items-center bg-[var(--surface-2)] rounded-xl p-3">
              <span className="w-24 h-14 rounded-lg bg-[var(--navy)] flex items-center justify-center text-[var(--gold-light)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-xs text-[var(--success-text)] font-semibold">
                  Reconhecido: {det.rotulo}
                  {det.rotulo === "Vídeo protegido" ? " · só toca dentro da plataforma" : ""}
                </span>
                <span className="text-sm break-all">{link}</span>
              </span>
            </div>
          )}
        </section>

        <section className={card}>
          <h2 className="m-0 font-serif font-semibold text-2xl">Tarefa desta aula</h2>
          <input value={tarefa} onChange={(e) => setTarefa(e.target.value)} placeholder="Ex.: Grave 1 minuto pedindo mais prazo para uma entrega real (opcional)" aria-label="Tarefa" className={campo} />
          <span className="text-[13px] font-semibold">Como o aluno entrega</span>
          <div className="flex gap-2 flex-wrap">
            {ENTREGAS.map((e) => (
              <button key={e.v} type="button" onClick={() => setEntrega(e.v)} aria-pressed={entrega === e.v} className={pill(entrega === e.v)}>
                {e.l}
              </button>
            ))}
          </div>
          <p className="m-0 text-[13px] text-[var(--text-secondary)]">{ENTREGAS.find((e) => e.v === entrega)?.a}</p>
          {entrega === "link" && (
            <input value={linkTarefa} onChange={(e) => setLinkTarefa(e.target.value)} type="url" placeholder="https://..." aria-label="Link da atividade" className={campo} />
          )}
        </section>
      </div>

      <section className="flex-[1_1_380px] min-w-0 bg-[var(--surface)] border-2 border-[var(--gold)] rounded-[18px] p-[22px] flex flex-col gap-[18px]">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 font-serif font-semibold text-[28px]">Quem vê esta aula</h2>
          <p className="m-0 text-sm text-[var(--text-secondary)]">Combine programas e alunos. Quem não estiver aqui não vê.</p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold">Programas</span>
          {programas.map((p) => {
            const ligado = !!on[p.id];
            return (
              <button
                key={p.id}
                type="button"
                role="switch"
                aria-checked={ligado}
                onClick={() => setOn({ ...on, [p.id]: !ligado })}
                className="flex items-center justify-between gap-3 min-h-12 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-left"
              >
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">{p.nome}</span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {p.alunos} {p.alunos === 1 ? "aluno" : "alunos"}
                  </span>
                </span>
                <span
                  className={`w-11 h-[26px] rounded-[13px] shrink-0 flex items-center p-[3px] box-border ${
                    ligado ? "bg-[var(--navy)] justify-end" : "bg-[var(--border-strong)] justify-start"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-[10px] ${ligado ? "bg-[var(--gold-light)]" : "bg-white"}`} />
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold">E também estes alunos</span>
          <div className="flex gap-2 flex-wrap">
            {alunos
              .filter((a) => escolhidos.includes(a.id))
              .map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setEscolhidos(escolhidos.filter((x) => x !== a.id))}
                  aria-label={`Remover ${a.nome}`}
                  className="h-9 pl-3 pr-2 rounded-full bg-[var(--navy)] text-[var(--on-navy)] text-[13px] flex items-center gap-1.5"
                >
                  {a.nome}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              ))}
          </div>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar aluno pelo nome" aria-label="Buscar aluno" className={`${campo} h-10 text-sm`} />
          <div className="flex gap-2 flex-wrap">
            {sugestoes.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setEscolhidos([...escolhidos, a.id])}
                className="h-9 px-3 rounded-full border border-dashed border-[#8f96a3] bg-[var(--surface)] text-[13px]"
              >
                + {a.nome} · {a.programa}
              </button>
            ))}
          </div>
        </div>

        <div role="status" className="bg-[var(--warning-bg)] rounded-xl p-3.5 flex flex-col gap-1.5">
          <span className="text-xs tracking-[0.08em] uppercase text-[var(--warning-text)] font-semibold">Resumo</span>
          <span className="text-[15px] font-semibold">
            {resumo.total} {resumo.total === 1 ? "aluno vai" : "alunos vão"} ver esta aula
          </span>
          <span className="text-[13px] leading-snug">{resumo.texto}</span>
        </div>

        {erro && (
          <p role="alert" className="m-0 text-sm text-[var(--danger-text)]">
            {erro}
          </p>
        )}
        <button
          type="button"
          onClick={publicar}
          disabled={isPending}
          className="h-12 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-[15px] disabled:opacity-60"
        >
          {isPending ? "Publicando..." : "Publicar aula"}
        </button>
      </section>
    </div>
  );
}
