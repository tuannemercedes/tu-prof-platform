import { createClient } from "@/lib/supabase/server";

export default async function AlunoCalendarioPage() {
  const supabase = await createClient();
  const { data: turmas } = await supabase.from("turmas").select("id, nome, calendario_embed_url");

  const calendarios = (turmas ?? []).filter((t) => t.calendario_embed_url);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-serif font-semibold">Calendário</h1>

      {calendarios.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {calendarios.map((t) => (
            <iframe
              key={t.id}
              src={t.calendario_embed_url!}
              className="w-full h-[500px] rounded-lg border border-[var(--border)]"
              title={`Calendário ${t.nome}`}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-secondary)]">Nenhum calendário configurado ainda.</p>
      )}
    </div>
  );
}
