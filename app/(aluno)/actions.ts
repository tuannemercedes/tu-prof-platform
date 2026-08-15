"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";

export async function marcarNovidadesVistas() {
  const user = await getUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ ultimo_acesso_novidades: new Date().toISOString() })
    .eq("id", user.id);
}
