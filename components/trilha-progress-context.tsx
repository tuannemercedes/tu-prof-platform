"use client";

import { createContext, useContext, useState } from "react";
import CelebrationOverlay from "./celebration-overlay";

type ContextValue = {
  notificarConclusao: (concluido: boolean) => void;
};

const TrilhaProgressContext = createContext<ContextValue | null>(null);

export function TrilhaProgressProvider({
  titulo,
  total,
  concluidosIniciais,
  children,
}: {
  titulo: string;
  total: number;
  concluidosIniciais: number;
  children: React.ReactNode;
}) {
  const [concluidos, setConcluidos] = useState(concluidosIniciais);
  const [celebrando, setCelebrando] = useState(false);

  function notificarConclusao(concluido: boolean) {
    const next = concluido ? concluidos + 1 : concluidos - 1;
    setConcluidos(next);
    if (concluido && next === total && total > 0) {
      setCelebrando(true);
    }
  }

  return (
    <TrilhaProgressContext.Provider value={{ notificarConclusao }}>
      {children}
      {celebrando && <CelebrationOverlay titulo={titulo} onClose={() => setCelebrando(false)} />}
    </TrilhaProgressContext.Provider>
  );
}

export function useTrilhaProgress() {
  return useContext(TrilhaProgressContext);
}
