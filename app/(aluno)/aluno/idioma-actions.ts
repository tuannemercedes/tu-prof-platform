"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function trocarIdioma(idioma: "espanhol" | "ingles") {
  (await cookies()).set("idioma", idioma, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/aluno", "layout");
}
