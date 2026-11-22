import { requireAluno, getUser } from "@/lib/dal";
import AlunoNav from "@/components/aluno-nav";
import { createClient } from "@/lib/supabase/server";
import { getNovidadesParaAluno } from "@/lib/notificacoes";

export default async function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAluno();
  const user = await getUser();

  const supabase = await createClient();
  const [{ data: config }, novidades] = await Promise.all([
    supabase.from("configuracoes").select("chave, valor"),
    getNovidadesParaAluno(supabase, user!.id, profile.ultimo_acesso_novidades),
  ]);

  const valor = (chave: string) => config?.find((c) => c.chave === chave)?.valor;
  const primeiroNome = (profile.nome || profile.email).split(" ")[0];

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <AlunoNav
        nome={primeiroNome}
        novidades={novidades}
        appUrl={valor("app_treino_url")}
        appLabel={valor("app_treino_label")}
        contatoUrl={valor("contato_url")}
        contatoLabel={valor("contato_label")}
      />
      <main className="flex-1 min-w-0 px-4 sm:px-10 pt-6 sm:pt-10 pb-28 sm:pb-12">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
