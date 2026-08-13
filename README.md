# Tu Prof — Plataforma de Mentoria

Portal para os mentorados: matérias, materiais (incluindo páginas HTML
interativas), turmas, calendário e progresso — com painel de admin simples.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind v4)
- Supabase (Postgres + Auth por e-mail e senha + Storage)
- Custo: R$0/mês nos planos gratuitos de Vercel + Supabase, para a escala inicial.

## 1. Criar o projeto no Supabase

1. Crie uma conta grátis em [supabase.com](https://supabase.com) e um novo projeto.
2. Vá em **SQL Editor > New query**, cole todo o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e rode.
   Isso cria as tabelas, as políticas de segurança (RLS) e o bucket de arquivos.
3. Em **Project Settings > API**, copie a `Project URL`, a `anon public key` e a `service_role key`.
4. Em **Authentication > Sign In / Providers**, confirme que "Email" está habilitado (é o padrão).

## 2. Configurar o projeto localmente

```bash
cp .env.local.example .env.local
```

Preencha o `.env.local` com os valores copiados do Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## 3. Criar sua conta de admin

Não existe tela de cadastro pública (só admin cria contas). Pra criar a
primeira conta (a sua):

1. No Supabase, vá em **Authentication > Users > Add user > Create new user**.
2. Preencha seu e-mail e uma senha, marque **Auto Confirm User**, e crie.
3. No **SQL Editor**, rode pra virar admin:

```sql
update public.profiles set role = 'admin' where email = 'seu-email@exemplo.com';
```

4. Entre em `/login` com esse e-mail e senha.

## 4. Como funciona no dia a dia

- **Turmas**: grupos de alunos (ex: turma geral, um clube de conversação). Cada material pode ser liberado por turma. É lá também que você cola o link de embed do Google Calendar de cada turma (Google Calendar > Configurações > Integrar calendário > "URL de incorporação").
- **Alunos**: adicione pelo e-mail — uma senha é gerada na hora. Copie o e-mail e a senha e envie pro aluno por fora (WhatsApp, etc). Ele entra em `/login` com esses dados. Se esquecer a senha, use "Redefinir senha" na lista de alunos.
- **Matérias**: pastas de conteúdo. Não existe uma seção "Extras" separada no código — crie uma matéria chamada "Extras" (ou o nome que preferir) e adicione ali playlists, podcasts, filmes e links.
- **Materiais**: dentro de cada matéria, escolha o tipo — página HTML (cole o código gerado no ChatGPT/Claude, com preview ao vivo), PDF, vídeo, playlist, podcast ou link. Marque quais turmas têm acesso.
- **Configurações**: link do botão fixo que aparece pro aluno, direcionando pro seu outro app (de treino).

## 5. Publicar (quando quiser sair do localhost)

1. Suba o código para um repositório no GitHub.
2. Crie uma conta grátis na [Vercel](https://vercel.com), importe o repositório.
3. Cole as mesmas variáveis do `.env.local` nas configurações do projeto na Vercel (trocando `NEXT_PUBLIC_SITE_URL` pela URL final, ex: `https://seudominio.vercel.app`).
4. Deploy.

Domínio próprio é opcional — a Vercel já dá uma URL gratuita `.vercel.app`.
