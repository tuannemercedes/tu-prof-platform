"use client";

import { useEffect, useState } from "react";

export default function CelebrationOverlay({
  titulo,
  onClose,
}: {
  titulo: string;
  onClose: () => void;
}) {
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSaindo(true), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!saindo) return;
    const t = setTimeout(onClose, 300);
    return () => clearTimeout(t);
  }, [saindo, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/40 transition-opacity duration-300 ${
        saindo ? "opacity-0" : "opacity-100"
      }`}
      onClick={() => setSaindo(true)}
    >
      <div
        className={`bg-[var(--surface)] rounded-2xl p-8 text-center space-y-2 shadow-2xl max-w-xs mx-4 transition-transform duration-300 ${
          saindo ? "scale-90" : "scale-100"
        }`}
      >
        <span aria-hidden="true" className="botao-ouro mx-auto w-14 h-14 rounded-full flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <p className="text-lg font-serif font-semibold">{titulo} concluída!</p>
        <p className="text-sm text-[var(--text-secondary)]">Parabéns por terminar tudo por aqui.</p>
      </div>
    </div>
  );
}
