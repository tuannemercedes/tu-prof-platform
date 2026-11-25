import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { salvarCompetencias, updateConfiguracoes } from "./actions";
import { lerCompetencias } from "@/lib/evolucao";
import SubmitButton from "@/components/submit-button";
import AvisosPreferencias from "@/components/avisos-preferencias";
import BotaoTesteEmail from "@/components/botao-teste-email";
import { AVISOS_EQUIPE, ROTULO_TIPO } from "@/lib/avisos";
import { getProfile } from "@/lib/dal";
import { quandoCompleto } from "@/lib/datas";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const [{ data: config }, profile, { data: historico }] = await Promise.all([
    supabase.from("configuracoes").select("chave, valor"),
    getProfile(),
    supabase
      .from("avisos_fila")
      .select("id, tipo, status, erro, criado_em, enviado_em, profiles(nome, email)")
      .order("criado_em", { ascending: false })
      .limit(15),
  ]);
  let emailStatus: { chave?: boolean; remetente?: string; ultima_execucao?: string } = {};
  try {
    emailStatus = JSON.parse(config?.find((c) => c.chave === "email_status")?.valor ?? "{}");
  } catch {}

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

      <section id="avisos" className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-5 space-y-4 scroll-mt-6">
        <div className="space-y-1">
          <h2 className="m-0 font-serif font-semibold text-2xl">Avisos por e-mail</h2>
          <p className="m-0 text-[13px] text-[var(--text-secondary)]">
            Lembretes de aula, tarefas novas, prazos, comentários e o resumo da semana saem sozinhos para os alunos.
            Cada aluno escolhe o que quer receber em &quot;Meu perfil&quot;.
          </p>
        </div>
        <div
          className={`rounded-xl p-3.5 text-sm ${emailStatus.chave ? "bg-[var(--success-bg)] text-[var(--success-text)]" : "bg-[var(--warning-bg)] text-[var(--warning-text)]"}`}
        >
          {emailStatus.chave ? (
            <>
              <strong>Ligado.</strong> Remetente: {emailStatus.remetente}.
            </>
          ) : (
            <>
              <strong>Ainda não está enviando.</strong> Falta cadastrar a chave do Resend. Enquanto isso, os avisos ficam guardados na fila.
            </>
          )}
          {emailStatus.ultima_execucao && (
            <span className="block text-[12px] opacity-80 mt-1">Última verificação: {quandoCompleto(emailStatus.ultima_execucao)}</span>
          )}
        </div>
        <BotaoTesteEmail email={profile?.email ?? ""} />
        <div className="space-y-2">
          <h3 className="m-0 text-sm font-semibold">Os seus avisos</h3>
          <AvisosPreferencias opcoes={AVISOS_EQUIPE} atuais={(profile?.avisos ?? {}) as Record<string, unknown>} />
        </div>
        {historico && historico.length > 0 && (
          <details className="rounded-xl border border-[var(--border)]">
            <summary className="cursor-pointer px-3.5 h-11 flex items-center text-sm font-semibold">Últimos avisos</summary>
            <ul className="m-0 p-0 list-none divide-y divide-[var(--border-soft)] border-t border-[var(--border)]">
              {historico.map((h) => {
                const quem = h.profiles as unknown as { nome: string | null; email: string } | null;
                const cor =
                  h.status === "enviado"
                    ? "text-[var(--success-text)]"
                    : h.status === "erro"
                      ? "text-[var(--danger-text)]"
                      : "text-[var(--text-secondary)]";
                return (
                  <li key={h.id} className="px-3.5 py-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[13px]">
                    <span className="font-semibold">{ROTULO_TIPO[h.tipo] ?? h.tipo}</span>
                    <span className="text-[var(--text-secondary)]">{quem?.nome || quem?.email}</span>
                    <span className={`ml-auto font-semibold ${cor}`}>
                      {h.status === "enviado" ? "enviado" : h.status === "pendente" ? "na fila" : h.status}
                    </span>
                    {h.erro && h.status !== "enviado" && <span className="basis-full text-[12px] text-[var(--text-secondary)]">{h.erro}</span>}
                  </li>
                );
              })}
            </ul>
          </details>
        )}
      </section>

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
