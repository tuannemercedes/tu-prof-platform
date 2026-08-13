import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";
import PerfilForm from "@/components/perfil-form";
import SenhaForm from "@/components/senha-form";

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
      <div>
        <h1 className="text-lg font-semibold">Meu perfil</h1>
        <p className="text-sm text-gray-500">{profile?.email}</p>
      </div>

      <PerfilForm nomeAtual={profile?.nome ?? ""} />

      <div className="pt-6 border-t border-gray-100">
        <h2 className="text-sm font-semibold mb-3">Alterar senha</h2>
        <SenhaForm />
      </div>
    </div>
  );
}
