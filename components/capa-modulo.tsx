"use client";

import { useState } from "react";
import SubmitButton from "./submit-button";
import BotaoConfirmar from "./botao-confirmar";

const PRONTAS = ["pronta-globo", "pronta-ondas", "pronta-constelacao", "apresentar", "correos", "negociar", "smalltalk", "status", "presenting"].map(
  (n) => `/capas-prontas/${n}.jpg`,
);

// Capa do módulo: ver, baixar, enviar uma imagem (com prévia antes de salvar),
// escolher uma capa pronta da marca ou remover.
export default function CapaModulo({
  id,
  titulo,
  capaUrl,
  salvarAction,
  prontaAction,
}: {
  id: string;
  titulo: string;
  capaUrl: string | null;
  salvarAction: (fd: FormData) => void | Promise<void>;
  prontaAction: (fd: FormData) => void | Promise<void>;
}) {
  const [previa, setPrevia] = useState<string | null>(null);
  const [galeria, setGaleria] = useState(false);
  const mostrada = previa ?? capaUrl;

  return (
    <section className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 font-serif text-[22px] font-semibold">Capa</h2>
        <p className="m-0 text-xs text-[var(--text-secondary)]">
          Aparece na Trilha do aluno e no topo do módulo. Ideal: imagem horizontal, 1600 × 900.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] items-start">
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-[var(--border)]">
          {mostrada ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mostrada} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="capa-padrao w-full h-full flex items-end p-4 text-[#e9cf8a] font-serif font-semibold text-lg">{titulo}</div>
          )}
          {previa && (
            <span className="absolute top-2 left-2 text-[11px] font-semibold px-2 py-1 rounded-md bg-black/60 text-white">Prévia: falta salvar</span>
          )}
        </div>

        <form action={salvarAction} className="flex flex-col gap-3" onSubmit={() => setTimeout(() => setPrevia(null), 800)}>
          <input type="hidden" name="id" value={id} />
          <div className="flex flex-wrap gap-2">
            <label className="h-10 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-semibold inline-flex items-center gap-2 cursor-pointer">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
              </svg>
              Enviar imagem
              <input
                type="file"
                name="capa"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setPrevia(f ? URL.createObjectURL(f) : null);
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => setGaleria((g) => !g)}
              aria-expanded={galeria}
              className="h-10 px-4 rounded-xl border border-[var(--border-strong)] text-sm font-semibold hover:bg-[var(--surface-2)]"
            >
              Capas prontas da marca
            </button>
            {capaUrl && (
              <a
                href={capaUrl}
                download={`capa-${titulo.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-4 rounded-xl border border-[var(--border-strong)] text-sm font-semibold inline-flex items-center gap-2 hover:bg-[var(--surface-2)]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 4v12M7 11l5 5 5-5M5 20h14" />
                </svg>
                Baixar
              </a>
            )}
          </div>
          {previa && (
            <div className="flex items-center gap-3">
              <SubmitButton className="h-10 px-5 rounded-xl botao-ouro text-sm font-semibold" pendingText="Enviando…" savedText="✓ Capa salva">
                Salvar esta capa
              </SubmitButton>
              <button type="button" onClick={() => setPrevia(null)} className="text-sm text-[var(--text-secondary)] hover:underline">
                Cancelar
              </button>
            </div>
          )}
          {capaUrl && !previa && (
            <div>
              <input type="hidden" name="remover_capa" value="1" />
              <BotaoConfirmar
                mensagem="Remover a capa? O módulo volta a usar a capa azul padrão."
                className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]"
              >
                Remover capa
              </BotaoConfirmar>
            </div>
          )}
        </form>
      </div>

      {galeria && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 pt-1">
          {PRONTAS.map((src) => (
            <form key={src} action={prontaAction}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="capa" value={src} />
              <button
                type="submit"
                className={`block w-full aspect-video rounded-xl overflow-hidden border-2 transition-transform hover:scale-[1.02] ${
                  capaUrl === src ? "border-[var(--gold)]" : "border-transparent"
                }`}
                title="Usar esta capa"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="Capa pronta" className="w-full h-full object-cover" />
              </button>
            </form>
          ))}
        </div>
      )}
    </section>
  );
}
