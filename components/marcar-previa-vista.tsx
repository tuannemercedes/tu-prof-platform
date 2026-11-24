"use client";

import { useEffect } from "react";
import { marcarPreviaVista } from "@/app/previa-actions";

// Registra, uma vez, que o aluno abriu a prévia.
export default function MarcarPreviaVista({ aulaId }: { aulaId: string }) {
  useEffect(() => {
    marcarPreviaVista(aulaId);
  }, [aulaId]);
  return null;
}
