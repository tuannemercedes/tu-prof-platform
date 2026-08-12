import { requireAluno } from "@/lib/dal";
import SignOutButton from "@/components/sign-out-button";
import TreinoAppBanner from "@/components/treino-app-banner";
import { createClient } from "@/lib/supabase/server";

export default async function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAluno();

  const supabase = await createClient();
  const { data: config } = await supabase
    .from("configuracoes")
    .select("chave, valor");

  const appTreinoUrl = config?.find((c) => c.chave === "app_treino_url")?.valor;
  const appTreinoLabel =
    config?.find((c) => c.chave === "app_treino_label")?.valor ??
    "Acessar app de treino";

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Tu Prof</p>
          <p className="text-xs text-gray-500">Olá, {profile.nome || profile.email}</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <TreinoAppBanner url={appTreinoUrl} label={appTreinoLabel} />
          <SignOutButton />
        </div>
      </header>
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}
