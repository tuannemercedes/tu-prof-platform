import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the auth session cookie if needed. Real per-route
  // authorization (admin vs aluno) happens in the DAL (lib/dal.ts),
  // not here — this is only an optimistic redirect for logged-out users.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected =
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/professor") ||
    request.nextUrl.pathname.startsWith("/previa") ||
    request.nextUrl.pathname.startsWith("/relatorio") ||
    request.nextUrl.pathname.startsWith("/aluno");

  // Já entrou: a tela de login leva direto para a plataforma (atualizar a página
  // ou abrir o endereço salvo não pede a senha de novo).
  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return comCookies(NextResponse.redirect(url), response);
  }

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return comCookies(NextResponse.redirect(url), response);
  }

  return response;
}

// Um redirecionamento precisa levar junto os cookies da sessão renovada,
// senão o navegador fica com o token velho e a pessoa "cai" do login.
function comCookies(destino: NextResponse, origem: NextResponse) {
  origem.cookies.getAll().forEach((c) => destino.cookies.set(c));
  return destino;
}
