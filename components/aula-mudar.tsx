import SubmitButton from "@/components/submit-button";
import { desmarcarAula, remarcarAula } from "@/app/remarcacao-actions";

const campo = "rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2.5 text-sm font-normal";
const rotulo = "flex flex-col gap-1.5 text-[13px] font-semibold";
const botao = "rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] px-4 min-h-10 text-sm font-semibold";

// ISO -> "2026-11-25T18:00" no horário de Brasília (para o campo datetime-local)
export function paraCampoLocal(iso: string) {
  return new Date(new Date(iso).getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

// Remarcar ou desmarcar uma aula agendada (equipe). Fica dentro de um <details>.
export default function AulaMudar({ aulaId, data, voltar, grupo }: { aulaId: string; data: string | null; voltar: string; grupo?: boolean }) {
  return (
    <details className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
      <summary className="list-none cursor-pointer px-3.5 min-h-11 py-2 flex items-center text-sm font-semibold">Remarcar ou desmarcar</summary>
      <div className="px-3.5 pb-3.5 flex flex-col gap-4">
        <form action={remarcarAula} className="flex flex-col gap-2.5">
          <input type="hidden" name="aula_id" value={aulaId} />
          <input type="hidden" name="voltar" value={voltar} />
          <div className="flex flex-wrap gap-2 items-end">
            <label className={rotulo}>
              Nova data e hora
              <input type="datetime-local" name="data" required defaultValue={data ? paraCampoLocal(data) : ""} className={campo} />
            </label>
            <label className={`${rotulo} flex-1 min-w-[160px]`}>
              Motivo (opcional)
              <input name="motivo" placeholder="Ex.: feriado" className={campo} />
            </label>
          </div>
          <div>
            <SubmitButton className={botao} pendingText="Remarcando..." savedText="✓ Remarcada">
              Remarcar
            </SubmitButton>
          </div>
        </form>

        <form action={desmarcarAula} className="flex flex-col gap-2.5 pt-3 border-t border-[var(--border-soft)]">
          <input type="hidden" name="aula_id" value={aulaId} />
          <input type="hidden" name="voltar" value={voltar} />
          <fieldset className="m-0 p-0 border-0 flex flex-col gap-1.5 text-sm">
            <legend className="text-[13px] font-semibold mb-1">Desmarcar a aula</legend>
            <label className="flex gap-2 items-start">
              <input type="radio" name="cancelamento" value="repor" defaultChecked className="mt-1" />
              <span>Desmarcada com aviso: <b>fica uma reposição pendente</b></span>
            </label>
            <label className="flex gap-2 items-start">
              <input type="radio" name="cancelamento" value="sem_reposicao" className="mt-1" />
              <span>Falta sem aviso: <b>conta como aula dada</b>, sem reposição</span>
            </label>
          </fieldset>
          <input name="motivo" placeholder="Motivo (opcional)" aria-label="Motivo" className={campo} />
          <div>
            <SubmitButton
              className="rounded-xl border border-[var(--danger-text)] text-[var(--danger-text)] px-4 min-h-10 text-sm font-semibold"
              pendingText="Desmarcando..."
              savedText="✓ Desmarcada"
            >
              Desmarcar
            </SubmitButton>
          </div>
          <p className="m-0 text-xs text-[var(--text-secondary)]">{grupo ? "O grupo recebe" : "O aluno recebe"} um e-mail avisando da mudança.</p>
        </form>
      </div>
    </details>
  );
}
