import { redirect } from "next/navigation";
import { getProfile } from "@/lib/dal";

export default async function Home() {
  const profile = await getProfile();

  if (!profile) redirect("/login");
  redirect(profile.role === "admin" ? "/admin" : "/aluno");
}
