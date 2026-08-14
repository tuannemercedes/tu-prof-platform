import Link from "next/link";
import { getUser } from "@/lib/dal";
import RedefinirSenhaForm from "@/components/redefinir-senha-form";
import ThemeToggle from "@/components/theme-toggle";

export default async function RedefinirSenhaPage() {
  const user = await getUser();

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold">Criar nova senha</h1>
          <p className="text-sm text-[var(--text-secondary)]">Escolha a nova senha da sua conta.</p>
        </div>

        {user ? (
          <RedefinirSenhaForm />
        ) : (
          <div className="text-center space-y-2">
            <p className="text-sm text-[var(--danger-text)]">Esse link expirou ou já foi usado.</p>
            <Link href="/esqueci-senha" className="text-sm text-[var(--accent)] hover:underline">
              Solicitar um novo link
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
