"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signIn } from "./actions";
import ThemeToggle from "@/components/theme-toggle";
import Logo from "@/components/logo";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await signIn(formData);
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
          <h1>
            <Logo className="text-3xl" />
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Entre com seu e-mail e senha para acessar seus materiais.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-3">
          <input
            type="email"
            name="email"
            required
            placeholder="seu@email.com"
            className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <input
            type="password"
            name="password"
            required
            placeholder="Senha"
            className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium py-2 disabled:opacity-50 btn-glow"
          >
            {isPending ? "Entrando..." : "Entrar"}
          </button>
          {error && <p className="text-sm text-[var(--danger-text)] text-center">{error}</p>}
        </form>

        <p className="text-center text-sm">
          <Link href="/esqueci-senha" className="text-[var(--text-secondary)] hover:underline">
            Esqueci minha senha
          </Link>
        </p>
      </div>
    </main>
  );
}
