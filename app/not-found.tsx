import Link from "next/link";
import Logo from "@/components/logo";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-4">
        <Logo className="text-2xl" />
        <div className="space-y-1">
          <p className="text-lg font-semibold">Página não encontrada</p>
          <p className="text-sm text-[var(--text-secondary)]">
            O endereço que você tentou acessar não existe ou foi movido.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 btn-glow"
        >
          Voltar pro início
        </Link>
      </div>
    </main>
  );
}
