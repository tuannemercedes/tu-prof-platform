"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { getEmbedUrl } from "@/lib/embed";
import { toggleProgresso } from "@/app/(aluno)/aluno/actions";
import { HtmlFrame, TIPO_LABELS, type MaterialCardData } from "./material-card";
import { useTrilhaProgress } from "./trilha-progress-context";
import AccessTracker from "./access-tracker";
import IconeTipo from "./icone-tipo";

export type GrupoModulo = { titulo: string | null; itens: MaterialCardData[] };

// Tela do módulo no formato de "player": o conteúdo aberto à esquerda e a lista de aulas
// ao lado (no celular, logo abaixo), com anterior/próxima e "marcar como concluída".
export default function PlayerModulo({ grupos, readOnly }: { grupos: GrupoModulo[]; readOnly: boolean }) {
  const todos = useMemo(() => grupos.flatMap((g) => g.itens), [grupos]);
  const [feitos, setFeitos] = useState<Record<string, boolean>>(() => Object.fromEntries(todos.map((m) => [m.id, m.concluido])));
  const [atualId, setAtualId] = useState<string>(() => (todos.find((m) => !m.concluido) ?? todos[0])?.id ?? "");
  const [, startTransition] = useTransition();
  const trilha = useTrilhaProgress();
  const visor = useRef<HTMLDivElement>(null);

  // Links da Trilha, do Acervo e do botão "Continuar" apontam para #material-<id>.
  useEffect(() => {
    const abrir = () => {
      const m = window.location.hash.match(/^#material-(.+)$/);
      if (m && todos.some((x) => x.id === m[1])) {
        setAtualId(m[1]);
        visor.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    abrir();
    window.addEventListener("hashchange", abrir);
    return () => window.removeEventListener("hashchange", abrir);
  }, [todos]);

  if (!todos.length) return <p className="text-sm text-[var(--text-secondary)]">Nenhum material liberado aqui ainda.</p>;

  const idx = Math.max(
    0,
    todos.findIndex((m) => m.id === atualId),
  );
  const atual = todos[idx];
  const grupoAtual = grupos.find((g) => g.itens.some((m) => m.id === atual.id));
  const totalFeitos = todos.filter((m) => feitos[m.id]).length;

  function abrir(id: string, rolar = true) {
    setAtualId(id);
    history.replaceState(null, "", `#material-${id}`);
    if (rolar) visor.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Marca/desmarca uma aula. Na prévia muda só na tela (nada é salvo para o aluno).
  function marcar(valor: boolean, id = atual.id) {
    if (!!feitos[id] === valor) return;
    setFeitos((f) => ({ ...f, [id]: valor }));
    trilha?.notificarConclusao(valor);
    if (readOnly) return;
    startTransition(async () => {
      await toggleProgresso(id, valor);
    });
  }

  const embed = atual.url ? getEmbedUrl(atual.url) : null;
  const videoDireto = atual.url && /\.(mp4|webm|m4v)(\?|$)/i.test(atual.url);
  const anterior = todos[idx - 1];
  const proxima = todos[idx + 1];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
      {/* Conteúdo aberto */}
      <div ref={visor} className="scroll-mt-20 flex flex-col gap-4 min-w-0">
        {!readOnly && <AccessTracker key={atual.id} materialId={atual.id} />}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-text)]">
              {grupoAtual?.titulo ? `${grupoAtual.titulo} · ` : ""}
              {idx + 1} de {todos.length}
            </p>
            <h2 className="font-serif text-[24px] sm:text-[28px] font-semibold leading-tight">{atual.titulo}</h2>
          </div>
          <span className="shrink-0 mt-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--text-secondary)]">
            {TIPO_LABELS[atual.tipo] ?? atual.tipo}
          </span>
        </div>

        <div key={atual.id} className="rounded-[20px] overflow-hidden border border-[var(--border)] bg-[var(--surface)] carta-entra">
          {atual.tipo === "html" && atual.conteudo_html ? (
            <HtmlFrame conteudoHtml={atual.conteudo_html} titulo={atual.titulo} />
          ) : atual.tipo === "pdf" ? (
            <div className="p-8 flex flex-col items-center gap-3 text-center">
              <IconeTipo tipo="pdf" size={40} />
              {atual.signedUrl ? (
                <a
                  href={atual.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="botao-ouro h-11 px-5 rounded-xl text-sm font-semibold inline-flex items-center"
                >
                  Abrir o PDF
                </a>
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">Arquivo indisponível.</p>
              )}
            </div>
          ) : videoDireto ? (
            <video src={atual.url!} controls playsInline preload="metadata" className="w-full aspect-video bg-black block" />
          ) : embed ? (
            <iframe
              src={embed}
              className="w-full aspect-video bg-black block"
              allow="encrypted-media; autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={atual.titulo}
            />
          ) : atual.url ? (
            <div className="p-8 flex justify-center">
              <a
                href={atual.url}
                target="_blank"
                rel="noopener noreferrer"
                className="botao-ouro h-11 px-5 rounded-xl text-sm font-semibold inline-flex items-center"
              >
                Abrir o conteúdo
              </a>
            </div>
          ) : (
            <p className="p-6 text-sm text-[var(--text-secondary)]">Conteúdo indisponível.</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => marcar(!feitos[atual.id])}
            className={`inline-flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-60 ${
              feitos[atual.id]
                ? "bg-[var(--success-bg)] text-[var(--success-text)] border-transparent"
                : "bg-[var(--surface)] border-[var(--border-strong)] hover:border-[var(--gold)]"
            }`}
          >
            <Circulo feito={!!feitos[atual.id]} />
            {feitos[atual.id] ? "Concluída" : "Marcar como concluída"}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!anterior}
              onClick={() => anterior && abrir(anterior.id)}
              className="h-11 px-4 rounded-xl text-sm font-semibold border border-[var(--border-strong)] bg-[var(--surface)] disabled:opacity-40"
            >
              ‹ Anterior
            </button>
            <button
              type="button"
              disabled={!proxima}
              onClick={() => {
                if (!proxima) return;
                if (!feitos[atual.id]) marcar(true);
                abrir(proxima.id);
              }}
              className="botao-ouro h-11 px-5 rounded-xl text-sm font-semibold disabled:opacity-40"
            >
              Próxima ›
            </button>
          </div>
        </div>
      </div>

      {/* Lista de aulas do módulo */}
      <aside className="lg:sticky lg:top-20 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-[var(--border)]">
          <p className="text-sm font-semibold">Conteúdo do módulo</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--gold)] transition-all duration-500"
                style={{ width: `${(totalFeitos / todos.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
              {totalFeitos} de {todos.length}
            </span>
          </div>
        </div>
        <div className="max-h-none lg:max-h-[calc(100vh-12rem)] overflow-y-auto py-2">
          {grupos.map((g, gi) => (
            <div key={gi} className="py-1">
              {g.titulo && (
                <p className="px-5 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">{g.titulo}</p>
              )}
              <ul className="list-none m-0 p-0">
                {g.itens.map((m) => {
                  const on = m.id === atual.id;
                  return (
                    <li
                      key={m.id}
                      className={`flex items-center transition-colors ${
                        on ? "bg-[var(--navy)] text-[var(--on-navy)] shadow-[inset_3px_0_0_var(--gold)]" : "hover:bg-[var(--surface-2)]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => marcar(!feitos[m.id], m.id)}
                        aria-pressed={!!feitos[m.id]}
                        aria-label={`${feitos[m.id] ? "Desmarcar" : "Marcar como concluída"}: ${m.titulo}`}
                        title={feitos[m.id] ? "Desmarcar" : "Marcar como concluída"}
                        className="shrink-0 self-stretch pl-5 pr-2 flex items-center group"
                      >
                        <span className="flex rounded-full transition-transform group-hover:scale-110 group-active:scale-95">
                          <Circulo feito={!!feitos[m.id]} claro={on} />
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => abrir(m.id)}
                        aria-current={on ? "true" : undefined}
                        className="min-w-0 flex-1 text-left flex items-center gap-3 pl-1 pr-5 py-2.5"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-medium leading-snug line-clamp-2">{m.titulo}</span>
                          <span className={`flex items-center gap-1.5 text-xs ${on ? "text-[var(--gold-light)]" : "text-[var(--text-faint)]"}`}>
                            <IconeTipo tipo={m.tipo} size={13} />
                            {TIPO_LABELS[m.tipo] ?? m.tipo}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function Circulo({ feito, claro = false }: { feito: boolean; claro?: boolean }) {
  return feito ? (
    <span className="shrink-0 w-[22px] h-[22px] rounded-full bg-[var(--gold)] text-[#0e1b33] flex items-center justify-center">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12l5 5L20 7" />
      </svg>
    </span>
  ) : (
    <span
      className={`block shrink-0 w-[22px] h-[22px] rounded-full border-2 ${claro ? "border-white/40" : "border-[var(--border-strong)]"}`}
      aria-hidden="true"
    />
  );
}
