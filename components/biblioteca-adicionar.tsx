"use client";

import { useState, useTransition } from "react";
import { criarItemBiblioteca } from "@/app/(admin)/admin/(gestao)/biblioteca/actions";
import { detectarTipo } from "@/lib/links";
import CampoIdioma from "./campo-idioma";
import { destinoSugerido } from "@/lib/capas";

type Props = {
  turmas: { id: string; nome: string }[];
  alunos: { id: string; nome: string }[];
  colecoes: { id: string; titulo: string; categoria: string }[];
  idiomaInicial?: string;
};

const pill = (on: boolean) =>
  `h-9 px-3 rounded-full text-[13px] font-medium border ${
    on ? "bg-[var(--navy)] text-[var(--on-navy)] border-[var(--navy)]" : "bg-[var(--surface)] text-[var(--text-primary)] border-[var(--border-strong)]"
  }`;
const campo = "h-10 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)]";

export default function BibliotecaAdicionar({ turmas, alunos, colecoes, idiomaInicial }: Props) {
  const [link, setLink] = useState("");
  const [titulo, setTitulo] = useState("");
  const [idioma, setIdioma] = useState(idiomaInicial === "ingles" ? "ingles" : "espanhol");
  const [quem, setQuem] = useState<"todos" | "programa" | "aluno">("todos");
  const [turmaId, setTurmaId] = useState(turmas[0]?.id ?? "");
  const [alunoId, setAlunoId] = useState(alunos[0]?.id ?? "");
  const [colecaoId, setColecaoId] = useState("");
  const [destinoManual, setDestinoManual] = useState<"fia" | "biblioteca" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const det = detectarTipo(link);
  const destino = destinoManual ?? destinoSugerido(det.tipo);
  const colecoesDoDestino = colecoes.filter((c) => c.categoria === destino);

  function adicionar() {
    setMsg(null);
    startTransition(async () => {
      const r = await criarItemBiblioteca({
        link,
        titulo,
        idioma,
        destino,
        colecaoId: colecoesDoDestino.some((c) => c.id === colecaoId) ? colecaoId : null,
        quem,
        turmaId: quem === "programa" ? turmaId : null,
        alunoId: quem === "aluno" ? alunoId : null,
      });
      if (r?.error) setMsg({ ok: false, t: r.error });
      else {
        const nomeIdioma = idioma === "ingles" ? "inglês" : idioma === "espanhol_ingles" ? "espanhol e inglês" : "espanhol";
        setMsg({ ok: true, t: `Adicionado na ${destino === "fia" ? "FIA" : "Biblioteca"} de ${nomeIdioma}.` });
        setLink("");
        setTitulo("");
        setDestinoManual(null);
      }
    });
  }

  return (
    <section className="bg-[var(--navy)] text-[var(--on-navy)] rounded-[20px] p-6 flex flex-col gap-4">
      <CampoIdioma name="" escuro rotulo="Este item é de qual idioma?" value={idioma} onChange={setIdioma} />
      <label className="flex flex-col gap-2.5 text-[15px] font-semibold">
        Cole um link
        <input
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            setMsg(null);
          }}
          placeholder="https://..."
          className="h-[54px] rounded-xl border border-[#2e4066] bg-[var(--navy-2)] text-[var(--on-navy)] px-4 text-base font-normal"
        />
      </label>

      {link.trim() && (
        <div className="bg-[var(--bg)] text-[var(--text-primary)] rounded-2xl p-[18px] flex flex-col gap-4">
          <div className="flex gap-3.5 items-center">
            <span className="w-14 h-14 rounded-xl bg-[var(--navy)] text-[var(--gold-light)] text-xs font-semibold flex items-center justify-center text-center leading-tight px-1">
              {det.rotulo}
            </span>
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="text-xs text-[var(--success-text)] font-semibold">Reconhecido automaticamente: {det.rotulo}</span>
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título (opcional)" aria-label="Título" className={campo} />
            </div>
          </div>
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold">Vai para</span>
              <div className="flex gap-1.5 flex-wrap">
                {([
                  { v: "fia", l: "FIA · praticar" },
                  { v: "biblioteca", l: "Biblioteca · estudar" },
                ] as const).map((d) => (
                  <button key={d.v} type="button" onClick={() => setDestinoManual(d.v)} aria-pressed={destino === d.v} className={pill(destino === d.v)}>
                    {d.l}
                  </button>
                ))}
              </div>
              {!destinoManual && <span className="text-xs text-[var(--text-secondary)]">Sugestão automática pelo tipo do link</span>}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold">Quem vê</span>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { v: "todos", l: "Todos os alunos" },
                  { v: "programa", l: "Um programa" },
                  { v: "aluno", l: "Só um aluno" },
                ].map((q) => (
                  <button key={q.v} type="button" onClick={() => setQuem(q.v as typeof quem)} aria-pressed={quem === q.v} className={pill(quem === q.v)}>
                    {q.l}
                  </button>
                ))}
              </div>
              {quem === "programa" && (
                <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} aria-label="Programa" className={campo}>
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              )}
              {quem === "aluno" && (
                <select value={alunoId} onChange={(e) => setAlunoId(e.target.value)} aria-label="Aluno" className={campo}>
                  {alunos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {colecoesDoDestino.length > 1 && (
              <label className="flex flex-col gap-2 text-[13px] font-semibold">
                Coleção
                <select value={colecaoId} onChange={(e) => setColecaoId(e.target.value)} className={campo}>
                  <option value="">Automática</option>
                  {colecoesDoDestino.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titulo}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <div className="flex gap-3.5 items-center flex-wrap">
            <button
              type="button"
              onClick={adicionar}
              disabled={isPending}
              className="h-[46px] px-[22px] rounded-xl bg-[var(--gold)] text-[var(--navy)] font-semibold text-[15px] disabled:opacity-60"
            >
              {isPending ? "Adicionando..." : "Adicionar à biblioteca"}
            </button>
            {msg && (
              <span role="status" className={`text-sm font-semibold ${msg.ok ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}`}>
                {msg.t}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
