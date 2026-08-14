"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordReset } from "./actions";
import ThemeToggle from "@/components/theme-toggle";

export default function EsqueciSenhaPage() {
  const [enviado, setEnviado] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await requestPasswordReset(formData);
      setEnviado(true);
    });
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold">Esqueci minha senha</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Informe seu e-mail e enviaremos um link para você criar uma senha nova.
          </p>
        </div>

        {enviado ? (
          <p className="text-sm text-[var(--success-text)] text-center">
            Se esse e-mail estiver cadastrado, você vai receber um link em instantes. Confira também o spam.
          </p>
        ) : (
          <form action={handleSubmit} className="space-y-3">
            <input
              type="email"
              name="email"
              required
              placeholder="seu@email.com"
              className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium py-2 disabled:opacity-50 btn-glow"
            >
              {isPending ? "Enviando..." : "Enviar link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm">
          <Link href="/login" className="text-[var(--text-secondary)] hover:underline">
            ← Voltar pro login
          </Link>
        </p>
      </div>
    </main>
  );
}
