"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/logo";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-4">
        <Logo className="text-2xl" />
        <div className="space-y-1">
          <p className="text-lg font-semibold">Algo deu errado</p>
          <p className="text-sm text-[var(--text-secondary)]">
            Tivemos um problema inesperado. Você pode tentar de novo ou voltar pro início.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 btn-glow"
          >
            Tentar de novo
          </button>
          <Link href="/" className="text-sm text-[var(--text-secondary)] hover:underline">
            Voltar pro início
          </Link>
        </div>
      </div>
    </main>
  );
}
