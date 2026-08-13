import { createClient } from "@/lib/supabase/server";
import { updateConfiguracoes } from "./actions";

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
        <p className="text-sm text-gray-500">
          O botão do UZUS e o link de contato aparecem juntos no rodapé da
          barra lateral do aluno. Os links de calendário são configurados por
          turma na página de <span className="font-mono">Turmas</span>.
        </p>
      </div>

      <form action={updateConfiguracoes} className="space-y-3 border border-gray-200 rounded-lg p-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Recado para os alunos (aparece no Início) — opcional
          </label>
          <textarea
            name="recado_mentora"
            defaultValue={recadoMentora}
            rows={3}
            placeholder="Ex: Bem-vindo(a)! Esse é o seu espaço para evoluir no inglês com confiança."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-y"
          />
        </div>
        <hr className="border-gray-100" />
        <div>
          <label className="text-xs text-gray-500 block mb-1">Link do UZUS</label>
          <input
            type="url"
            name="app_treino_url"
            defaultValue={appTreinoUrl}
            placeholder="https://..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Texto do botão</label>
          <input
            type="text"
            name="app_treino_label"
            defaultValue={appTreinoLabel}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <hr className="border-gray-100" />
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Link de contato (WhatsApp, e-mail...) — opcional
          </label>
          <input
            type="url"
            name="contato_url"
            defaultValue={contatoUrl}
            placeholder="https://wa.me/55..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Texto do link de contato</label>
          <input
            type="text"
            name="contato_label"
            defaultValue={contatoLabel}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-black text-white text-sm font-medium px-4 py-2"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
