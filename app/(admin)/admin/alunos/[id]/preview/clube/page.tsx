import { createClient } from "@/lib/supabase/server";
import PreviewNav from "@/components/preview-nav";
import CalendarGrid from "@/components/calendar-grid";
import { getClubeAcessoParaAluno } from "@/lib/clube";

export default async function PreviewClubePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const temAcesso = await getClubeAcessoParaAluno(supabase, id);

  if (!temAcesso) {
    return (
      <div className="space-y-6">
        <PreviewNav alunoId={id} />
        <p className="text-sm text-[var(--text-secondary)]">
          Este aluno ainda não tem acesso ao Clube de Conversação.
        </p>
      </div>
    );
  }

  const [{ data: config }, { data: temas }] = await Promise.all([
    supabase.from("clube_config").select("link_acesso, dia_horario").eq("id", 1).single(),
    supabase.from("clube_temas").select("id, data, tema, descricao").order("data"),
  ]);

  const hoje = new Date().toISOString().slice(0, 10);
  const proximoTema =
    (temas ?? []).filter((t) => t.data >= hoje).sort((a, b) => (a.data < b.data ? -1 : 1))[0] ?? null;

  let rsvpAtual: boolean | null = null;
  if (proximoTema) {
    const { data: rsvp } = await supabase
      .from("clube_rsvps")
      .select("confirmado")
      .eq("tema_id", proximoTema.id)
      .eq("aluno_id", id)
      .maybeSingle();
    rsvpAtual = rsvp?.confirmado ?? null;
  }

  return (
    <div className="space-y-6">
      <PreviewNav alunoId={id} />
      <div>
        <h1 className="text-lg font-semibold">Clube de Conversação</h1>
        <p className="text-sm text-[var(--text-secondary)]">Pratique conversação com a turma.</p>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2 card-elevated">
        {config?.dia_horario && (
          <p className="text-sm">
            <span className="text-[var(--text-secondary)]">Quando: </span>
            {config.dia_horario}
          </p>
        )}
        {proximoTema && (
          <p className="text-sm">
            <span className="text-[var(--text-secondary)]">Próximo tema: </span>
            {proximoTema.tema}
            <span className="text-[var(--text-secondary)]">
              {" "}
              ({new Date(`${proximoTema.data}T00:00:00`).toLocaleDateString("pt-BR")})
            </span>
          </p>
        )}
        {config?.link_acesso && (
          <a
            href={config.link_acesso}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 hover:bg-[var(--accent-hover)] transition-colors btn-glow"
          >
            Entrar na sala ↗
          </a>
        )}

        {proximoTema && (
          <p className="text-sm">
            <span className="text-[var(--text-secondary)]">Confirmação: </span>
            {rsvpAtual === true && <span className="text-[var(--success-text)]">Vai participar ✓</span>}
            {rsvpAtual === false && <span className="text-[var(--danger-text)]">Não vai participar</span>}
            {rsvpAtual === null && <span className="text-[var(--text-secondary)]">Ainda não respondeu</span>}
          </p>
        )}
      </div>

      <CalendarGrid eventos={(temas ?? []).map((t) => ({ data: t.data, tema: t.tema }))} />
    </div>
  );
}
