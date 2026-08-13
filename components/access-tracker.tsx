"use client";

import { useEffect, useRef } from "react";
import { recordAccess } from "@/app/(aluno)/aluno/actions";

export default function AccessTracker({ materialId }: { materialId: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    recordAccess(materialId);
  }, [materialId]);

  return null;
}
