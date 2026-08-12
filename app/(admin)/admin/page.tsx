import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [{ count: turmasCount }, { count: alunosCount }, { count: materiaisCount }] =
    await Promise.all([
      supabase.from("turmas").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "aluno"),
      supabase.from("materiais").select("*", { count: "exact", head: true }),
    ]);

  const cards = [
    { label: "Turmas", value: turmasCount ?? 0 },
    { label: "Alunos", value: alunosCount ?? 0 },
    { label: "Materiais", value: materiaisCount ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Visão geral</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-gray-200 p-4"
          >
            <p className="text-2xl font-semibold">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
