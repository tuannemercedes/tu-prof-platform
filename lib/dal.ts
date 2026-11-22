import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getProfile = cache(async () => {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
});

export function homeFor(role: string | null | undefined) {
  if (role === "admin") return "/admin";
  if (role === "professor") return "/professor";
  return "/aluno";
}

export async function requireAdmin() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect(homeFor(profile.role));
  return profile;
}

export async function requireProfessor() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "professor") redirect(homeFor(profile.role));
  return profile;
}

export async function requireAluno() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "aluno") redirect(homeFor(profile.role));
  return profile;
}
