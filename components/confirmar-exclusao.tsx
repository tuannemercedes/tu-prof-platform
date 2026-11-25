"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

// Botão de excluir em dois passos: primeiro pergunta, depois apaga.
// Fica dentro de um <form action={...}> com os campos escondidos necessários.
function Confirmar({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-9 px-3.5 rounded-lg bg-[var(--danger-text)] text-white text-[13px] font-semibold disabled:opacity-60"
    >
      {pending ? "Excluindo..." : texto}
    </button>
  );
}

export default function ConfirmarExclusao({
  rotulo,
  aviso,
  confirmar = "Sim, excluir",
}: {
  rotulo: string;
  aviso: string;
  confirmar?: string;
}) {
  const [aberto, setAberto] = useState(false);
  if (!aberto) {
    return (
      <button type="button" onClick={() => setAberto(true)} className="text-[13px] text-[var(--danger-text)] font-semibold">
        {rotulo}
      </button>
    );
  }
  return (
    <div role="alert" className="flex flex-col gap-2 rounded-xl bg-[var(--danger-bg)] p-3">
      <span className="text-[13px] text-[var(--danger-text)]">{aviso}</span>
      <div className="flex gap-2 items-center">
        <Confirmar texto={confirmar} />
        <button type="button" onClick={() => setAberto(false)} className="h-9 px-3 text-[13px] text-[var(--text-secondary)]">
          Cancelar
        </button>
      </div>
    </div>
  );
}
