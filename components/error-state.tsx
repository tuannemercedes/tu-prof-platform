"use client";

export default function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-8 text-center space-y-3">
      <p className="text-2xl">⚠️</p>
      <p className="text-sm font-medium">Algo deu errado</p>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
        Tivemos um problema inesperado nessa página. Tenta de novo.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 btn-glow"
      >
        Tentar de novo
      </button>
    </div>
  );
}
