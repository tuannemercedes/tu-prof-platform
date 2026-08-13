"use client";

import { useState, useTransition, useRef } from "react";
import { updatePassword } from "@/app/(aluno)/aluno/perfil/actions";

export default function SenhaForm() {
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setErro(null);
    setSucesso(false);
    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result?.error) {
        setErro(result.error);
      } else {
        setSucesso(true);
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs text-[var(--text-secondary)] block mb-1">Senha atual</label>
        <input
          type="password"
          name="senhaAtual"
          required
          className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-[var(--text-secondary)] block mb-1">Nova senha</label>
        <input
          type="password"
          name="novaSenha"
          required
          minLength={6}
          className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-[var(--text-secondary)] block mb-1">Confirmar nova senha</label>
        <input
          type="password"
          name="confirmarSenha"
          required
          minLength={6}
          className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 disabled:opacity-50 btn-glow"
      >
        {isPending ? "Salvando..." : "Alterar senha"}
      </button>
      {erro && <p className="text-sm text-[var(--danger-text)]">{erro}</p>}
      {sucesso && <p className="text-sm text-[var(--success-text)]">Senha atualizada!</p>}
    </form>
  );
}
