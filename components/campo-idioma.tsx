"use client";

import { useState } from "react";

const OPCOES = [
  { valor: "espanhol", rotulo: "Espanhol" },
  { valor: "ingles", rotulo: "Inglês" },
  { valor: "espanhol_ingles", rotulo: "Os dois" },
];

type Props = {
  name?: string;
  defaultValue?: string | null;
  value?: string;
  onChange?: (v: string) => void;
  rotulo?: string;
  escuro?: boolean;
};

// Escolha do idioma de um conteúdo (Espanhol, Inglês ou Os dois).
// Funciona dentro de formulários (envia o campo "name") ou controlado (value/onChange).
export default function CampoIdioma({ name = "idioma", defaultValue, value, onChange, rotulo = "Idioma", escuro = false }: Props) {
  const [interno, setInterno] = useState(defaultValue || "espanhol");
  const atual = value ?? interno;

  function escolher(v: string) {
    if (onChange) onChange(v);
    else setInterno(v);
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className={`text-[13px] font-semibold ${escuro ? "" : "text-[var(--text-primary)]"}`}>{rotulo}</span>
      <div
        role="radiogroup"
        aria-label={rotulo}
        className={`flex rounded-full p-1 gap-1 ${escuro ? "bg-[var(--navy-2)]" : "bg-[var(--surface-3)]"}`}
      >
        {OPCOES.map((o) => {
          const on = atual === o.valor;
          return (
            <button
              key={o.valor}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => escolher(o.valor)}
              className={`h-8 px-3.5 rounded-full text-[13px] font-semibold ${
                on
                  ? escuro
                    ? "bg-[var(--gold)] text-[var(--navy)]"
                    : "bg-[var(--navy)] text-[var(--gold-light)]"
                  : escuro
                    ? "text-[var(--on-navy-muted)]"
                    : "text-[var(--text-secondary)]"
              }`}
            >
              {o.rotulo}
            </button>
          );
        })}
      </div>
      {name && <input type="hidden" name={name} value={atual} />}
    </div>
  );
}
