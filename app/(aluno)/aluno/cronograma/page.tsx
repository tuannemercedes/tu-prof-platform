import { createClient } from "@/lib/supabase/server";

export default async function AlunoCronogramaPage() {
  const supabase = await createClient();

  const { data: itens } = await supabase
    .from("cronograma_itens")
    .select("id, data, tema, descricao")
    .order("data");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Cronograma</h1>
        <p className="text-sm text-[var(--text-secondary)]">Sua trajetória ao longo da mentoria.</p>
      </div>

      {itens?.length ? (
        <ol className="space-y-4">
          {itens.map((item) => (
            <li key={item.id} className="border-l-2 border-[var(--border)] pl-4">
              <p className="text-xs text-[var(--text-faint)]">
                {item.data
                  ? new Date(item.data + "T00:00:00").toLocaleDateString("pt-BR")
                  : "Sem data"}
              </p>
              <p className="text-sm font-medium">{item.tema}</p>
              {item.descricao && <p className="text-sm text-[var(--text-secondary)]">{item.descricao}</p>}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-[var(--text-secondary)]">Seu cronograma ainda não foi montado.</p>
      )}
    </div>
  );
}
