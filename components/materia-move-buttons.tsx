"use client";

import { useTransition } from "react";
import { moverMateria } from "@/app/(admin)/admin/materias/actions";

type Props = {
  id: string;
  categoria: string;
  isFirst: boolean;
  isLast: boolean;
};

export default function MateriaMoveButtons({ id, categoria, isFirst, isLast }: Props) {
  const [isPending, startTransition] = useTransition();

  function mover(direcao: "up" | "down") {
    startTransition(async () => {
      await moverMateria(id, categoria, direcao);
    });
  }

  return (
    <div className="flex flex-col shrink-0">
      <button
        type="button"
        onClick={() => mover("up")}
        disabled={isFirst || isPending}
        aria-label="Mover para cima"
        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-25 disabled:cursor-not-allowed leading-none px-1 py-0.5"
      >
        ▲
      </button>
      <button
        type="button"
        onClick={() => mover("down")}
        disabled={isLast || isPending}
        aria-label="Mover para baixo"
        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-25 disabled:cursor-not-allowed leading-none px-1 py-0.5"
      >
        ▼
      </button>
    </div>
  );
}
