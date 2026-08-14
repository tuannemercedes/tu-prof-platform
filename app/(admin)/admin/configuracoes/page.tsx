import { createClient } from "@/lib/supabase/server";
import { updateConfiguracoes } from "./actions";
import SubmitButton from "@/components/submit-button";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: config } = await supabase.from("configuracoes").select("chave, valor");

  const appTreinoUrl = config?.find((c) => c.chave === "app_treino_url")?.valor ?? "";
  const appTreinoLabel =
    config?.find((c) => c.chave === "app_treino_label")?.valor ?? "UZUS - Seu simulador";
  const contatoUrl = config?.find((c) => c.chave === "contato_url")?.valor ?? "";
  const contatoLabel =
    config?.find((c) => c.chave === "contato_label")?.valor ?? "Fale comigo";
  const recadoMentora = config?.find((c) => c.chave === "recado_mentora")?.valor ?? "";

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h1 className="text-lg font-semibold">Configurações</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          O botão do UZUS e o link de contato aparecem juntos no rodapé da
          barra lateral do aluno. Os links de calendário são configurados por
          turma na página de <span className="font-mono">Turmas</span>.
        </p>
      </div>

      <form action={updateConfiguracoes} className="space-y-3 border border-[var(--border)] rounded-lg p-4">
        <div>
          <label className="text-xs text-[var(--text-secondary)] block mb-1">
            Recado para os alunos (aparece no Início) — opcional
          </label>
          <textarea
            name="recado_mentora"
            defaultValue={recadoMentora}
            rows={3}
            placeholder="Ex: Bem-vindo(a)! Esse é o seu espaço para evoluir no inglês com confiança."
            className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm resize-y"
          />
        </div>
        <hr className="border-[var(--border-soft)]" />
        <div>
          <label className="text-xs text-[var(--text-secondary)] block mb-1">Link do UZUS</label>
          <input
            type="url"
            name="app_treino_url"
            defaultValue={appTreinoUrl}
            placeholder="https://..."
            className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] block mb-1">Texto do botão</label>
          <input
            type="text"
            name="app_treino_label"
            defaultValue={appTreinoLabel}
            className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
          />
        </div>
        <hr className="border-[var(--border-soft)]" />
        <div>
          <label className="text-xs text-[var(--text-secondary)] block mb-1">
            Link de contato (WhatsApp, e-mail...) — opcional
          </label>
          <input
            type="url"
            name="contato_url"
            defaultValue={contatoUrl}
            placeholder="https://wa.me/55..."
            className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] block mb-1">Texto do link de contato</label>
          <input
            type="text"
            name="contato_label"
            defaultValue={contatoLabel}
            className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
          />
        </div>
        <SubmitButton className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 btn-glow whitespace-nowrap">
          Salvar
        </SubmitButton>
      </form>
    </div>
  );
}
