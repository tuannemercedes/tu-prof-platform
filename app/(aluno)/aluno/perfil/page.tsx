import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";
import PerfilForm from "@/components/perfil-form";
import SenhaForm from "@/components/senha-form";
import CabecalhoPagina from "@/components/cabecalho-pagina";

export default async function AlunoPerfilPage() {
  const user = await getUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, email")
    .eq("id", user!.id)
    .single();

  return (
    <div className="space-y-6 max-w-sm">
<CabecalhoPagina sobretitulo="Minha conta" titulo="Meu perfil" descricao={profile?.email} />

      <PerfilForm nomeAtual={profile?.nome ?? ""} />

      <div className="pt-6 border-t border-[var(--border-soft)]">
        <h2 className="text-sm font-semibold mb-3">Alterar senha</h2>
        <SenhaForm />
      </div>
    </div>
  );
}
