"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
  savedText?: string;
};

export default function SubmitButton({
  children,
  className,
  pendingText = "Salvando...",
  savedText = "✓ Salvo!",
}: Props) {
  const { pending } = useFormStatus();
  const [showSaved, setShowSaved] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      setShowSaved(true);
      const t = setTimeout(() => setShowSaved(false), 1600);
      return () => clearTimeout(t);
    }
    wasPending.current = pending;
  }, [pending]);

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : showSaved ? savedText : children}
    </button>
  );
}
