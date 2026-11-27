"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signIn } from "./actions";
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

  const campo =
    "w-full h-12 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-[15px] text-white placeholder:text-white/45 transition-colors focus:outline-none focus:border-[#d9b866] focus:bg-white/[0.09] focus:shadow-[0_0_0_3px_rgba(217,184,102,0.2)]";

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[#081120] text-white">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/videos/login-planeta.jpg"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/login-planeta.mp4" type="video/mp4" />
      </video>
      {/* Véu: escurece à esquerda para o cartão respirar e deixa o planeta brilhar */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,17,32,0.25),rgba(8,17,32,0.75))]" />

      <div className="login-cartao relative z-10 w-full max-w-[400px] rounded-[28px] p-[1px]">
        <div className="relative rounded-[27px] bg-[rgba(10,20,40,0.62)] backdrop-blur-2xl px-8 pt-9 pb-8 space-y-7 overflow-hidden">
          {/* luz dourada no canto */}
          <div className="pointer-events-none absolute -top-24 -right-20 w-64 h-64 rounded-full bg-[#c9a24d]/25 blur-3xl" />
          <div className="relative text-center space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/monograma-tp.png" alt="" aria-hidden="true" className="w-14 h-14 mx-auto drop-shadow-[0_6px_18px_rgba(201,162,77,0.45)]" />
            <h1 className="m-0">
              <Logo className="h-8 mx-auto block" />
            </h1>
            <p className="m-0 text-sm text-white/65">Entre para acessar suas aulas, materiais e sua evolução.</p>
          </div>

          <form action={handleSubmit} className="relative space-y-3">
            <label className="sr-only" htmlFor="email">
              E-mail
            </label>
            <input id="email" type="email" name="email" required autoComplete="email" placeholder="seu@email.com" className={campo} />
            <label className="sr-only" htmlFor="password">
              Senha
            </label>
            <input id="password" type="password" name="password" required autoComplete="current-password" placeholder="Senha" className={campo} />
            <button
              type="submit"
              disabled={isPending}
              className="botao-ouro w-full h-12 rounded-xl text-[15px] font-semibold tracking-wide transition-transform hover:-translate-y-px disabled:opacity-60"
            >
              {isPending ? "Entrando..." : "Entrar"}
            </button>
            {error && <p className="text-sm text-[#f0a08c] text-center">{error}</p>}
          </form>

          <p className="relative text-center text-sm m-0">
            <Link href="/esqueci-senha" className="text-white/60 hover:text-[#d9b866] transition-colors">
              Esqueci minha senha
            </Link>
          </p>
        </div>
      </div>

      <p className="absolute bottom-5 inset-x-0 text-center text-xs tracking-[0.22em] uppercase text-white/45">
        Comunicação profissional e internacional
      </p>
    </main>
  );
}
