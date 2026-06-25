"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function AccesoPanelForm() {
  const router = useRouter();
  const [valor, setValor] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const slug = valor.trim().toLowerCase().replace(/\s+/g, "-");
    if (!slug) return;
    router.push(`/${encodeURIComponent(slug)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <input
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="Identificador de tu empresa"
        className="flex-1 rounded-md border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Acceder
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
