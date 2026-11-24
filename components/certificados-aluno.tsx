import { createClient } from "@/lib/supabase/server";
import SubmitButton from "@/components/submit-button";
import ConfirmarExclusao from "@/components/confirmar-exclusao";
import { emitirCertificado, excluirCertificado } from "@/app/certificado-actions";
import { dataExtenso, tituloDoTipo } from "@/lib/certificados";

const campo = "h-[42px] rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[15px] font-normal";
const rotulo = "flex flex-col gap-1.5 text-[13px] font-semibold";

// Certificados de um aluno na ficha (equipe): lista e emissão.
export default async function CertificadosAluno({
  alunoId,
  nome,
  programaSugerido,
  podeEmitir,
}: {
  alunoId: string;
  nome: string;
  programaSugerido: string;
  podeEmitir: boolean;
}) {
  const supabase = await createClient();
  const { data: lista } = await supabase
    .from("certificados")
    .select("id, codigo, tipo, titulo, emitido_em")
    .eq("aluno_id", alunoId)
    .order("emitido_em", { ascending: false });

  return (
    <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-5 flex flex-col gap-4">
      <h2 className="m-0 font-serif font-semibold text-2xl">Certificados</h2>
      {lista?.length ? (
        <ul className="m-0 p-0 list-none divide-y divide-[var(--border-soft)]">
          {lista.map((c) => (
            <li key={c.id} className="py-2.5 flex flex-col gap-1.5">
              <div className="flex items-start gap-3">
                <span className="flex-1 flex flex-col">
                  <span className="text-[15px] font-semibold">{c.titulo}</span>
                  <span className="text-[13px] text-[var(--text-secondary)]">
                    {tituloDoTipo(c.tipo)} · {dataExtenso(c.emitido_em)} · código {c.codigo}
                  </span>
                </span>
                <a href={`/certificado/${c.codigo}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--gold-text)] whitespace-nowrap">
                  Abrir ↗
                </a>
              </div>
              {podeEmitir && (
                <form action={excluirCertificado}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="voltar" value={`/admin/alunos/${alunoId}`} />
                  <ConfirmarExclusao rotulo="Excluir certificado" aviso="O certificado deixa de existir e o código passa a aparecer como inválido." />
                </form>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-sm text-[var(--text-secondary)]">Nenhum certificado emitido.</p>
      )}

      {podeEmitir && (
        <details className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
          <summary className="list-none cursor-pointer px-3.5 h-11 flex items-center text-sm font-semibold">+ Emitir certificado</summary>
          <form action={emitirCertificado} className="px-3.5 pb-3.5 flex flex-col gap-3">
            <input type="hidden" name="aluno_id" value={alunoId} />
            <label className={rotulo}>
              Tipo
              <select name="tipo" defaultValue="conclusao" className={campo}>
                <option value="conclusao">Conclusão</option>
                <option value="participacao">Participação</option>
              </select>
            </label>
            <label className={rotulo}>
              Curso ou programa
              <input name="titulo" required defaultValue={programaSugerido} className={campo} />
            </label>
            <label className={rotulo}>
              Nome no certificado
              <input name="nome_impresso" required defaultValue={nome} className={campo} />
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className={rotulo}>
                Início
                <input name="inicio" type="date" className={campo} />
              </label>
              <label className={rotulo}>
                Fim
                <input name="fim" type="date" className={campo} />
              </label>
              <label className={rotulo}>
                Horas
                <input name="carga_horaria" type="number" min={1} className={campo} />
              </label>
            </div>
            <label className={rotulo}>
              Empresa (opcional)
              <input name="empresa" placeholder="Só para certificados de participação do Corporate" className={campo} />
            </label>
            <SubmitButton className="self-start h-10 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-semibold">
              Emitir certificado
            </SubmitButton>
          </form>
        </details>
      )}
    </section>
  );
}
