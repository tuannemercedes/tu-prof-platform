"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordReset, verifyRecoveryCode } from "./actions";

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
    <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[#081120] text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/videos/login-planeta.jpg" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,17,32,0.35),rgba(8,17,32,0.8))]" />
      <div className="login-cartao relative z-10 w-full max-w-[400px] rounded-[28px] p-[1px]">
      <div className="rounded-[27px] bg-[rgba(10,20,40,0.66)] backdrop-blur-2xl px-8 py-9 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="font-serif text-2xl font-semibold m-0">Esqueci minha senha</h1>
          <p className="text-sm text-white/65">
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
              className="w-full h-12 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-[15px] text-white placeholder:text-white/45 focus:outline-none focus:border-[#d9b866] focus:shadow-[0_0_0_3px_rgba(217,184,102,0.2)]"
            />
            <button
              type="submit"
              disabled={isPending}
              className="botao-ouro w-full h-12 rounded-xl text-[15px] font-semibold disabled:opacity-60"
            >
              {isPending ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        ) : (
          <form action={handleVerifySubmit} className="space-y-3">
            <p className="text-xs text-white/65 text-center -mt-2">
              Código enviado pra <span className="font-medium">{email}</span>. Confira também o spam.
            </p>
            <input
              type="text"
              name="token"
              required
              inputMode="numeric"
              placeholder="Código de 6 dígitos"
              className="w-full h-12 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-[15px] text-white placeholder:text-white/45 focus:outline-none focus:border-[#d9b866] focus:shadow-[0_0_0_3px_rgba(217,184,102,0.2)] text-center tracking-widest"
            />
            <input
              type="password"
              name="novaSenha"
              required
              minLength={6}
              placeholder="Nova senha"
              className="w-full h-12 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-[15px] text-white placeholder:text-white/45 focus:outline-none focus:border-[#d9b866] focus:shadow-[0_0_0_3px_rgba(217,184,102,0.2)]"
            />
            <input
              type="password"
              name="confirmarSenha"
              required
              minLength={6}
              placeholder="Confirmar nova senha"
              className="w-full h-12 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-[15px] text-white placeholder:text-white/45 focus:outline-none focus:border-[#d9b866] focus:shadow-[0_0_0_3px_rgba(217,184,102,0.2)]"
            />
            <button
              type="submit"
              disabled={isPending}
              className="botao-ouro w-full h-12 rounded-xl text-[15px] font-semibold disabled:opacity-60"
            >
              {isPending ? "Confirmando..." : "Criar nova senha"}
            </button>
            {error && <p className="text-sm text-[#f0a08c] text-center">{error}</p>}
            <button
              type="button"
              onClick={() => {
                setCodigoEnviado(false);
                setError(null);
              }}
              className="w-full text-xs text-white/65 hover:underline"
            >
              Usar outro e-mail
            </button>
          </form>
        )}

        <p className="text-center text-sm">
          <Link href="/login" className="text-white/65 hover:underline">
            ← Voltar pro login
          </Link>
        </p>
      </div>
      </div>
    </main>
  );
}
