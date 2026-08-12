"use client";

import { useState, useTransition } from "react";
import { sendMagicLink } from "./actions";

export default function LoginPage() {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await sendMagicLink(formData);
      if (result?.error) {
        setStatus("error");
        setMessage(result.error);
      } else {
        setStatus("sent");
      }
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold">Tu Prof</h1>
          <p className="text-sm text-gray-500">
            Entre com seu e-mail para acessar seus materiais.
          </p>
        </div>

        {status === "sent" ? (
          <p className="text-sm text-center text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
            Link de acesso enviado! Confira seu e-mail e clique no link para entrar.
          </p>
        ) : (
          <form action={handleSubmit} className="space-y-3">
            <input
              type="email"
              name="email"
              required
              placeholder="seu@email.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-md bg-black text-white text-sm font-medium py-2 disabled:opacity-50"
            >
              {isPending ? "Enviando..." : "Enviar link de acesso"}
            </button>
            {status === "error" && (
              <p className="text-sm text-red-600">{message}</p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
