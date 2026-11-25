import SubmitButton from "@/components/submit-button";
import { salvarPrevia } from "@/app/previa-actions";
import { expressoesParaTexto, lerPrevia, liberaEm } from "@/lib/previa";
import { quandoCompleto } from "@/lib/datas";

const campo = "rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2.5 text-sm font-normal";
const rotulo = "flex flex-col gap-1.5 text-[13px] font-semibold";

// Formulário da prévia de uma aula (equipe). Fica dentro de um <details>.
export default function PreviaForm({
  aulaId,
  data,
  previa,
  voltar,
  vistas,
  total,
}: {
  aulaId: string;
  data: string | null;
  previa: unknown;
  voltar: string;
  vistas?: number;
  total?: number;
}) {
  const p = lerPrevia(previa);
  return (
    <details className="group rounded-xl border border-[var(--border)] bg-[var(--surface-2)]" open={false}>
      <summary className="list-none cursor-pointer px-3.5 min-h-11 py-2 flex flex-wrap items-center gap-x-2 text-sm font-semibold">
        <span>{p ? "✓ Prévia da aula" : "+ Escrever a prévia da aula"}</span>
        <span className="text-xs font-normal text-[var(--text-secondary)]">
          {data ? `o aluno vê a partir de ${quandoCompleto(liberaEm(data).toISOString())}` : ""}
          {p && total ? ` · ${vistas ?? 0} de ${total} abriram` : ""}
        </span>
      </summary>
      <form action={salvarPrevia} className="px-3.5 pb-3.5 flex flex-col gap-3">
        <input type="hidden" name="aula_id" value={aulaId} />
        <input type="hidden" name="voltar" value={voltar} />
        <label className={rotulo}>
          Objetivo da aula (uma frase)
          <input name="objetivo" defaultValue={p?.objetivo ?? ""} placeholder="Ex.: apresentar resultados do trimestre com segurança" className={`${campo} h-[42px]`} />
        </label>
        <label className={rotulo}>
          A situação que vamos simular
          <textarea name="situacao" rows={2} defaultValue={p?.situacao ?? ""} placeholder="Ex.: reunião mensal com o time de Bogotá; você abre com os números" className={campo} />
        </label>
        <label className={rotulo}>
          Expressões-chave (uma por linha: frase = tradução)
          <textarea
            name="expressoes"
            rows={5}
            defaultValue={expressoesParaTexto(p?.expressoes)}
            placeholder={"Les comparto los resultados = Compartilho os resultados\nComo pueden ver = Como vocês podem ver"}
            className={`${campo} font-mono`}
          />
        </label>
        <label className={rotulo}>
          Erro comum do brasileiro
          <input name="erro" defaultValue={p?.erro ?? ""} placeholder="Ex.: dizer “presupuesto” quando quer dizer “resultado”" className={`${campo} h-[42px]`} />
        </label>
        <label className={rotulo}>
          Para chegar preparado
          <input name="preparo" defaultValue={p?.preparo ?? ""} placeholder="Ex.: traga um número do seu trimestre para apresentar" className={`${campo} h-[42px]`} />
        </label>
        <SubmitButton className="self-start h-10 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-semibold">
          Salvar prévia
        </SubmitButton>
      </form>
    </details>
  );
}
