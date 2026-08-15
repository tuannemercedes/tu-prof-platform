"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordReset, verifyRecoveryCode } from "./actions";
import ThemeToggle from "@/components/theme-toggle";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRequestSubmit(formData: FormData) {
    setError(null);
    const emailDigitado = String(formData.get("email") || "").trim();
    startTransition(async () => {
      await requestPasswordReset(formData);
      setEmail(emailDigitado);
      setCodigoEnviado(true);
    });
  }

  function handleVerifySubmit(formData: FormData) {
    setError(null);
    formData.set("email", email);
    startTransition(async () => {
      const result = await verifyRecoveryCode(formData);
      if (result?.error) setError(result.error);
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
            {codigoEnviado
              ? "Digite o código de 6 dígitos que enviamos pro seu e-mail e escolha uma senha nova."
              : "Informe seu e-mail e enviaremos um código de 6 dígitos pra você criar uma senha nova."}
          </p>
        </div>

        {!codigoEnviado ? (
          <form action={handleRequestSubmit} className="space-y-3">
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
              {isPending ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        ) : (
          <form action={handleVerifySubmit} className="space-y-3">
            <p className="text-xs text-[var(--text-secondary)] text-center -mt-2">
              Código enviado pra <span className="font-medium">{email}</span>. Confira também o spam.
            </p>
            <input
              type="text"
              name="token"
              required
              inputMode="numeric"
              placeholder="Código de 6 dígitos"
              className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <input
              type="password"
              name="novaSenha"
              required
              minLength={6}
              placeholder="Nova senha"
              className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <input
              type="password"
              name="confirmarSenha"
              required
              minLength={6}
              placeholder="Confirmar nova senha"
              className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium py-2 disabled:opacity-50 btn-glow"
            >
              {isPending ? "Confirmando..." : "Criar nova senha"}
            </button>
            {error && <p className="text-sm text-[var(--danger-text)] text-center">{error}</p>}
            <button
              type="button"
              onClick={() => {
                setCodigoEnviado(false);
                setError(null);
              }}
              className="w-full text-xs text-[var(--text-secondary)] hover:underline"
            >
              Usar outro e-mail
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
