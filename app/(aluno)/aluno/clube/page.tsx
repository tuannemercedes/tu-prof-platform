import { createClient } from "@/lib/supabase/server";
import CalendarGrid from "@/components/calendar-grid";

export default async function AlunoClubePage() {
  const supabase = await createClient();

  const [{ data: config }, { data: temas }] = await Promise.all([
    supabase.from("clube_config").select("link_acesso, dia_horario").eq("id", 1).maybeSingle(),
    supabase.from("clube_temas").select("id, data, tema, descricao").order("data"),
  ]);

  if (!config) {
    return (
      <div className="max-w-2xl">
        <p className="text-sm text-[var(--text-secondary)]">
          Você ainda não tem acesso ao Clube de Conversação.
        </p>
      </div>
    );
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const proximoTema =
    (temas ?? [])
      .filter((t) => t.data >= hoje)
      .sort((a, b) => (a.data < b.data ? -1 : 1))[0] ?? null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-serif font-semibold">Clube de Conversação</h1>
        <p className="text-sm text-[var(--text-secondary)]">Pratique conversação com a turma.</p>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2 card-elevated">
        {config.dia_horario && (
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
        {config.link_acesso && (
          <a
            href={config.link_acesso}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 hover:bg-[var(--accent-hover)] transition-colors btn-glow"
          >
            Entrar na sala ↗
          </a>
        )}
      </div>

      <CalendarGrid eventos={(temas ?? []).map((t) => ({ data: t.data, tema: t.tema }))} />
    </div>
  );
}
