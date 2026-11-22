import { requireProfessor } from "@/lib/dal";
import Logo from "@/components/logo";
import SignOutButton from "@/components/sign-out-button";
import ThemeToggle from "@/components/theme-toggle";

export default async function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfessor();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between gap-4 px-4 sm:px-8 py-4 border-b border-[var(--border)]">
        <Logo />
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-[var(--text-secondary)]">
            {profile.nome || profile.email}
          </span>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>
      <main className="p-4 sm:p-8 max-w-4xl mx-auto">{children}</main>
    </div>
  );
}
