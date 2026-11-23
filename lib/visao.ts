import { createClient } from "@/lib/supabase/server";
import { getProfile, getUser } from "@/lib/dal";
import { getIdiomaDoAluno, idiomasDosProgramas, type Idioma } from "@/lib/idioma";

type Supa = Awaited<ReturnType<typeof createClient>>;

// "Visão" = de quem é a tela do aluno que estamos montando.
// - aluno logado: a RLS já filtra tudo o que ele pode ver;
// - prévia (equipe vendo como o aluno vê): a equipe enxerga mais coisas,
//   então o filtro de liberação é refeito aqui na aplicação.
export type Visao = {
  alunoId: string;
  nome: string;
  objetivo: string | null;
  linkAula: string | null;
  base: string;
  previa: boolean;
  idioma: Idioma;
  opcoes: Idioma[];
};

export async function visaoDoAlunoLogado(): Promise<Visao> {
  const [user, profile, supabase] = await Promise.all([getUser(), getProfile(), createClient()]);
  const { atual, opcoes } = await getIdiomaDoAluno(supabase, user!.id);
  return {
    alunoId: user!.id,
    nome: profile?.nome || profile?.email || "",
    objetivo: profile?.objetivo ?? null,
    linkAula: profile?.link_aula ?? null,
    base: "/aluno",
    previa: false,
    idioma: atual,
    opcoes,
  };
}

// Retorna null se quem está vendo não tem acesso a esse aluno (a RLS decide:
// a fundadora vê todos; o professor, só os dele).
export async function visaoPrevia(supabase: Supa, alunoId: string, idiomaPedido?: string): Promise<Visao | null> {
  const [{ data: aluno }, { data: membros }] = await Promise.all([
    supabase.from("profiles").select("id, nome, email, objetivo, link_aula, role").eq("id", alunoId).maybeSingle(),
    supabase.from("turma_membros").select("turmas(idioma)").eq("aluno_id", alunoId),
  ]);
  if (!aluno || aluno.role !== "aluno") return null;
  const opcoes = idiomasDosProgramas(
    (membros ?? []).map((m) => (m.turmas as unknown as { idioma: string } | null)?.idioma)
  );
  const idioma = opcoes.includes(idiomaPedido as Idioma) ? (idiomaPedido as Idioma) : opcoes[0];
  return {
    alunoId,
    nome: aluno.nome || aluno.email,
    objetivo: aluno.objetivo,
    linkAula: aluno.link_aula,
    base: `/previa/${alunoId}`,
    previa: true,
    idioma,
    opcoes,
  };
}

// Monta o endereço de uma tela do aluno. Na prévia, o idioma escolhido vai junto.
export function rota(v: Visao, caminho = "", hash = "", params: Record<string, string> = {}) {
  const sp = new URLSearchParams(params);
  if (v.previa) sp.set("idioma", v.idioma);
  const q = sp.toString();
  return `${v.base}${caminho}${q ? `?${q}` : ""}${hash}`;
}

export type Liberados = { materiais: Set<string>; turmas: Set<string> } | null;

// Na prévia, calcula quais materiais e programas o aluno realmente enxerga.
// Para o aluno logado devolve null (a RLS já cuidou disso).
export async function getLiberados(supabase: Supa, v: Visao): Promise<Liberados> {
  if (!v.previa) return null;
  const [{ data: membros }, { data: rows }] = await Promise.all([
    supabase.from("turma_membros").select("turma_id").eq("aluno_id", v.alunoId),
    supabase.from("materiais").select("id, visivel_todos, material_turmas(turma_id), material_alunos(aluno_id)"),
  ]);
  const turmas = new Set((membros ?? []).map((m) => m.turma_id as string));
  type Row = {
    id: string;
    visivel_todos: boolean;
    material_turmas: { turma_id: string }[];
    material_alunos: { aluno_id: string }[];
  };
  const materiais = new Set(
    ((rows ?? []) as unknown as Row[])
      .filter(
        (m) =>
          m.visivel_todos ||
          m.material_turmas.some((t) => turmas.has(t.turma_id)) ||
          m.material_alunos.some((a) => a.aluno_id === v.alunoId)
      )
      .map((m) => m.id)
  );
  return { materiais, turmas };
}

export function liberado(lib: Liberados, materialId: string) {
  return !lib || lib.materiais.has(materialId);
}

export async function nomeDoProfessor(supabase: Supa, v: Visao): Promise<string | null> {
  if (!v.previa) {
    const { data } = await supabase.rpc("meu_professor");
    return (data as string | null) ?? null;
  }
  const { data: aluno } = await supabase.from("profiles").select("professor_id").eq("id", v.alunoId).maybeSingle();
  if (aluno?.professor_id) {
    const { data: prof } = await supabase.from("profiles").select("nome").eq("id", aluno.professor_id).maybeSingle();
    if (prof?.nome) return prof.nome;
  }
  const { data } = await supabase.from("profiles").select("nome").eq("role", "admin").limit(1).maybeSingle();
  return data?.nome ?? null;
}
