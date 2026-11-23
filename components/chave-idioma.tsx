"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { trocarIdioma } from "@/app/(aluno)/aluno/idioma-actions";

type Idioma = "espanhol" | "ingles";
const ROTULO: Record<Idioma, string> = { espanhol: "Espanhol", ingles: "Inglês" };

export default function ChaveIdioma({
  atual,
  opcoes,
  previa = false,
}: {
  atual: Idioma;
  opcoes: Idioma[];
  previa?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  if (opcoes.length < 2) return null;

  return (
    <div role="group" aria-label="Idioma" className="flex rounded-full bg-[var(--navy-2)] p-1 gap-1">
      {opcoes.map((i) => {
        const on = i === atual;
        return (
          <button
            key={i}
            type="button"
            aria-pressed={on}
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                // Na prévia o idioma vai no endereço (não mexe no cookie de ninguém).
                if (previa) {
                  router.push(`${pathname}?idioma=${i}${window.location.hash}`);
                  return;
                }
                await trocarIdioma(i);
                router.refresh();
              })
            }
            className={`h-9 px-3.5 rounded-full text-[13px] font-semibold transition-colors ${
              on ? "bg-[var(--gold)] text-[var(--navy)]" : "text-[var(--on-navy-muted)]"
            }`}
          >
            {ROTULO[i]}
          </button>
        );
      })}
    </div>
  );
}
