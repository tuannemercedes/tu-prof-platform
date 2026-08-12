import { createClient } from "@/lib/supabase/server";
import { updateConfiguracoes } from "./actions";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: config } = await supabase.from("configuracoes").select("chave, valor");

  const appTreinoUrl = config?.find((c) => c.chave === "app_treino_url")?.valor ?? "";
  const appTreinoLabel =
    config?.find((c) => c.chave === "app_treino_label")?.valor ?? "Acessar app de treino";

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h1 className="text-lg font-semibold">Configurações</h1>
        <p className="text-sm text-gray-500">
          O botão do app de treino aparece fixo no topo da área do aluno.
          Os links de calendário são configurados por turma na página de{" "}
          <span className="font-mono">Turmas</span>.
        </p>
      </div>

      <form action={updateConfiguracoes} className="space-y-3 border border-gray-200 rounded-lg p-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Link do app de treino</label>
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
