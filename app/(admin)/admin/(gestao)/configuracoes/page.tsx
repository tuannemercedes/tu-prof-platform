import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { salvarCompetencias, updateConfiguracoes } from "./actions";
import { lerCompetencias } from "@/lib/evolucao";
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
  const competencias = lerCompetencias(config?.find((c) => c.chave === "competencias")?.valor);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-1.5">
        <h1 className="m-0 font-serif font-semibold text-[40px] leading-[1.05]">Configurações</h1>
        <p className="text-[15px] text-[var(--text-secondary)]">
          Recado do Início, botões do UZUS e de contato, competências da evolução e as demais ferramentas.
        </p>
      </div>

      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-5 space-y-3">
        <h2 className="m-0 font-serif font-semibold text-2xl">Ferramentas</h2>
        <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
          {[
            { href: "/admin/materias", t: "Módulos e aulas", d: "Conteúdo das trilhas" },
            { href: "/admin/clube", t: "Club Hispano", d: "Temas, link e presença" },
            { href: "/admin/glossario", t: "Glossário", d: "Termos e categorias" },
            { href: "/admin/fia", t: "Coleções da FIA", d: "Organização da biblioteca" },
          ].map((f) => (
            <Link key={f.href} href={f.href} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3.5 flex flex-col gap-0.5">
              <span className="text-[15px] font-semibold">{f.t}</span>
              <span className="text-[13px] text-[var(--text-secondary)]">{f.d}</span>
            </Link>
          ))}
        </div>
      </section>

      <form action={salvarCompetencias} className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-5 space-y-3">
        <h2 className="m-0 font-serif font-semibold text-2xl">Competências da evolução</h2>
        <p className="text-[13px] text-[var(--text-secondary)]">
          Uma por linha. São avaliadas em cada checkpoint (Travando, Em progresso, Segura).
        </p>
        <textarea
          name="competencias"
          rows={5}
          defaultValue={competencias.join("\n")}
          aria-label="Competências"
          className="bg-[var(--surface)] w-full rounded-[10px] border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
        <SubmitButton className="h-10 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-semibold">
          Salvar competências
        </SubmitButton>
      </form>

      <form action={updateConfiguracoes} className="space-y-3 bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-5">
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
