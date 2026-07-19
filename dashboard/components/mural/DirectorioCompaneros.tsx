"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { type MuralDirectorioItem, fetchMuralDirectorio } from "@/lib/api";
import { Avatar } from "@/components/Avatar";

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

  if (companeros !== null && companeros.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Users className="h-4 w-4" />
        </span>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Murales de tus compañeros</p>
      </div>

      {companeros === null ? (
        <div className="mt-3 h-16 animate-pulse rounded-md bg-muted" />
      ) : (
        <div className="mt-3 flex flex-wrap gap-3">
          {companeros.map((c) => (
            <Link
              key={c.id}
              href={`/${slug}/mi-mural/${c.id}`}
              className="flex w-20 flex-col items-center gap-1 text-center"
            >
              <Avatar nombreCompleto={c.nombreCompleto} fotoUrl={c.fotoUrl} size="lg" />
              <span className="line-clamp-1 text-xs font-medium text-foreground">
                {c.nombreCompleto.split(" ")[0]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
