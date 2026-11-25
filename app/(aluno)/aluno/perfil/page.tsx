import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";
import PerfilForm from "@/components/perfil-form";
import SenhaForm from "@/components/senha-form";
import CabecalhoPagina from "@/components/cabecalho-pagina";
import AvisosPreferencias from "@/components/avisos-preferencias";
import { AVISOS_ALUNO } from "@/lib/avisos";

export default async function AlunoPerfilPage() {
  const user = await getUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, email, avisos")
    .eq("id", user!.id)
    .single();

  return (
    <div className="space-y-6 max-w-lg">
<CabecalhoPagina sobretitulo="Minha conta" titulo="Meu perfil" descricao={profile?.email} />

      <PerfilForm nomeAtual={profile?.nome ?? ""} />

      <div className="pt-6 border-t border-[var(--border-soft)]">
        <h2 className="text-sm font-semibold mb-3">Alterar senha</h2>
        <SenhaForm />
      </div>

      <section id="avisos" className="pt-6 border-t border-[var(--border-soft)] scroll-mt-6">
        <h2 className="text-sm font-semibold mb-1">Avisos por e-mail</h2>
        <p className="text-[13px] text-[var(--text-secondary)] mb-3">Enviados para {profile?.email}. Escolha o que quer receber.</p>
        <AvisosPreferencias opcoes={AVISOS_ALUNO} atuais={(profile?.avisos ?? {}) as Record<string, unknown>} />
      </section>
    </div>
  );
}
