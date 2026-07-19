"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type MuralDirectorioItem, fetchMuralDirectorio } from "@/lib/api";
import { Avatar } from "@/components/Avatar";

/** Se muestra dentro de un Modal (ver MiMuralView) — sin card/encabezado propios. */
export function DirectorioCompaneros({ slug, propioTalentoId }: { slug: string; propioTalentoId: string }) {
  const [companeros, setCompaneros] = useState<MuralDirectorioItem[] | null>(null);

  useEffect(() => {
    let cancelado = false;
    fetchMuralDirectorio(slug)
      .then((data) => {
        if (!cancelado) setCompaneros(data.filter((c) => c.id !== propioTalentoId));
      })
      .catch(() => {
        if (!cancelado) setCompaneros([]);
      });
    return () => {
      cancelado = true;
    };
  }, [slug, propioTalentoId]);

  if (companeros === null) {
    return <div className="h-16 animate-pulse rounded-md bg-muted" />;
  }
  if (companeros.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay más compañeros con mural.</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {companeros.map((c) => (
        <Link
          key={c.id}
          href={`/${slug}/mi-mural/${c.id}`}
          className="flex w-20 flex-col items-center gap-1 text-center"
        >
          <Avatar nombreCompleto={c.nombreCompleto} fotoUrl={c.fotoUrl} size="lg" />
          <span className="line-clamp-1 text-xs font-medium text-foreground">{c.nombreCompleto.split(" ")[0]}</span>
        </Link>
      ))}
    </div>
  );
}
