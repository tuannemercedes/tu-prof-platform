"use client";

import { useState, useTransition } from "react";
import { signIn } from "./actions";

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
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold">Tu Prof</h1>
          <p className="text-sm text-gray-500">
            Entre com seu e-mail e senha para acessar seus materiais.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-3">
          <input
            type="email"
            name="email"
            required
            placeholder="seu@email.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="password"
            name="password"
            required
            placeholder="Senha"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-black text-white text-sm font-medium py-2 disabled:opacity-50"
          >
            {isPending ? "Entrando..." : "Entrar"}
          </button>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        </form>
      </div>
    </main>
  );
}
