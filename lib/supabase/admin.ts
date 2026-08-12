import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente com a service role key — só pode ser usado em código de servidor
// confiável (Server Actions do admin), nunca exposto ao navegador.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
