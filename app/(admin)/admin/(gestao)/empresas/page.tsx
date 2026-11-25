import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { contratoAtual, dataCurta, frequencia, getEmpresas, moeda } from "@/lib/empresas";
import { diaISO, quandoCompleto } from "@/lib/datas";
import { rotuloIdioma } from "@/lib/programas";
import SubmitButton from "@/components/submit-button";
import { criarEmpresa } from "./actions";

const campo = "h-[42px] rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[15px]";
const botao = "h-11 px-[18px] rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-sm whitespace-nowrap";

export default async function EmpresasPage() {
  const supabase = await createClient();
  const empresas = await getEmpresas(supabase);
  const hoje = diaISO(new Date());

  const total = empresas.reduce((s, e) => s + (contratoAtual(e.contratos)?.valor_mensal ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4 items-end justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 font-serif font-semibold text-[40px] leading-[1.05]">Empresas</h1>
          <p className="m-0 text-[15px] text-[var(--text-secondary)]">
            Tu Prof Corporate: contratos, grupos, aulas com presença e relatório para o RH.
          </p>
        </div>
        <form action={criarEmpresa} className="flex flex-wrap gap-2">
          <input name="nome" required placeholder="Nome da empresa" aria-label="Nome da empresa" className={campo} />
          <SubmitButton className={botao} pendingText="Criando..." savedText="✓ Criada">
            Nova empresa
          </SubmitButton>
        </form>
      </div>

      {empresas.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { v: empresas.length, l: empresas.length === 1 ? "Empresa" : "Empresas" },
            { v: empresas.reduce((s, e) => s + e.grupos.reduce((x, g) => x + g.participantes.length, 0), 0), l: "Participantes" },
            { v: moeda(total), l: "Contratos vigentes / mês" },
          ].map((k) => (
            <div key={k.l} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-1">
              <span className="font-serif font-semibold text-[30px] leading-none">{k.v}</span>
              <span className="text-[13px] text-[var(--text-secondary)]">{k.l}</span>
            </div>
          ))}
        </div>
      )}

      {empresas.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {empresas.map((e) => {
            const c = contratoAtual(e.contratos);
            const pessoas = e.grupos.reduce((s, g) => s + g.participantes.length, 0);
            const aulas = e.grupos.flatMap((g) => g.aulas);
            const proxima = aulas.find((a) => a.status === "agendada" && a.data && diaISO(a.data) >= hoje);
            const freqs = e.grupos.map((g) => frequencia(g.aulas)).filter(Boolean) as { media: number }[];
            const media = freqs.length ? Math.round((freqs.reduce((s, f) => s + f.media, 0) / freqs.length) * 10) / 10 : null;
            return (
              <Link
                key={e.id}
                href={`/admin/empresas/${e.id}`}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-5 flex flex-col gap-3 hover:border-[var(--gold)] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-serif font-semibold text-[26px] leading-tight">{e.nome}</span>
                  {c && (
                    <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--warning-bg)] text-[var(--warning-text)]">
                      {rotuloIdioma(c.idioma)}
                    </span>
                  )}
                </div>
                <span className="text-sm text-[var(--text-secondary)]">
                  {c
                    ? `${c.descricao ?? "Contrato"} · ${moeda(c.valor_mensal)}/mês · até ${dataCurta(c.fim)}`
                    : "Sem contrato cadastrado"}
                </span>
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[var(--border-soft)]">
                  <span className="flex flex-col pt-2">
                    <span className="text-lg font-semibold">
                      {pessoas}
                      {c?.max_acessos ? <span className="text-sm text-[var(--text-secondary)] font-normal"> / {c.max_acessos}</span> : null}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">acessos</span>
                  </span>
                  <span className="flex flex-col pt-2">
                    <span className="text-lg font-semibold">{media ?? "—"}</span>
                    <span className="text-xs text-[var(--text-secondary)]">presentes por aula</span>
                  </span>
                  <span className="flex flex-col pt-2">
                    <span className="text-sm font-semibold leading-snug">{proxima?.data ? quandoCompleto(proxima.data) : "—"}</span>
                    <span className="text-xs text-[var(--text-secondary)]">próxima aula</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-6">
          <p className="m-0 text-[15px] font-semibold">Nenhuma empresa ainda</p>
          <p className="mt-1.5 mb-0 text-sm text-[var(--text-secondary)]">
            Comece pelo nome da empresa. Depois você cadastra o contrato, cria os grupos e adiciona os participantes.
          </p>
        </div>
      )}
    </div>
  );
}
