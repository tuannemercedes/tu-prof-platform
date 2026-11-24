import type { OpcaoAviso } from "@/components/avisos-preferencias";

export const AVISOS_ALUNO: OpcaoAviso[] = [
  { chave: "aulas", titulo: "Lembretes de aula", descricao: "A prévia da aula (quando houver), a véspera e 1 hora antes." },
  { chave: "tarefas", titulo: "Tarefas", descricao: "Quando chega uma tarefa nova e um dia antes do prazo." },
  { chave: "comentarios", titulo: "Comentários da professora", descricao: "Quando sua entrega recebe um retorno." },
  { chave: "semana", titulo: "Resumo da semana", descricao: "Toda segunda de manhã: aulas e tarefas da semana." },
];

export const AVISOS_EQUIPE: OpcaoAviso[] = [
  { chave: "entregas", titulo: "Entregas dos alunos", descricao: "Quando um aluno responde uma tarefa ou envia áudio." },
  { chave: "diario", titulo: "Resumo do dia", descricao: "De manhã: aulas do dia e aulas que faltam registrar." },
];

export const ROTULO_TIPO: Record<string, string> = {
  teste: "Teste",
  tarefa_nova: "Tarefa nova",
  prazo: "Prazo amanhã",
  aula_vespera: "Aula (véspera)",
  aula_1h: "Aula em 1h",
  aula_previa: "Prévia da aula",
  comentario: "Comentário",
  semana: "Resumo da semana",
  entrega: "Entrega de aluno",
  diario: "Resumo do dia",
};
