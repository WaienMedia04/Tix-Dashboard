"use client";

import { useRef } from "react";
import { StickyNote } from "lucide-react";
import { type EstampaOtorgadaMural, type NotaMural, crearNotaMural } from "@/lib/api";
import { useEsMobile } from "@/lib/use-es-mobile";
import { NotaAdhesiva } from "./NotaAdhesiva";
import { EstampaPeel } from "./EstampaPeel";

const COLORES_ALEATORIOS = ["amarillo", "rosa", "celeste", "verde", "lila"];

export function MuralCanvas({
  notas,
  estampas,
  editable,
  onNotasChange,
}: {
  notas: NotaMural[];
  estampas: EstampaOtorgadaMural[];
  /** false cuando se está visitando el mural de otro empleado — solo lectura, sin drag. */
  editable: boolean;
  onNotasChange: (notas: NotaMural[]) => void;
}) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const esMobile = useEsMobile();
  const arrastrable = editable && !esMobile;

  async function agregarNota() {
    const color = COLORES_ALEATORIOS[Math.floor(Math.random() * COLORES_ALEATORIOS.length)];
    const posX = 10 + Math.random() * 70;
    const posY = 10 + Math.random() * 60;
    try {
      const nota = await crearNotaMural({ texto: "Escribe algo aquí...", color, posX, posY });
      onNotasChange([...notas, nota]);
    } catch {
      // sin cambios visibles si falla
    }
  }

  function actualizarNotaLocal(actualizada: NotaMural) {
    onNotasChange(notas.map((n) => (n.id === actualizada.id ? actualizada : n)));
  }

  function borrarNotaLocal(id: string) {
    onNotasChange(notas.filter((n) => n.id !== id));
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <StickyNote className="h-4 w-4" />
          </span>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {editable ? "Mi mural" : "Mural"}
          </p>
        </div>
        {editable && (
          <button
            onClick={() => void agregarNota()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <StickyNote className="h-3.5 w-3.5" />
            Nueva nota
          </button>
        )}
      </div>

      {arrastrable ? (
        <div
          ref={contenedorRef}
          className="relative mt-3 min-h-80 overflow-hidden rounded-md border border-dashed border-border/70 bg-black/5 dark:bg-white/5"
        >
          {notas.length === 0 && estampas.length === 0 && (
            <p className="flex h-80 items-center justify-center text-center text-xs text-muted-foreground">
              Agrega notas y arrástralas donde quieras. Las estampas que te regalen también aparecen aquí.
            </p>
          )}
          {notas.map((nota) => (
            <NotaAdhesiva
              key={nota.id}
              nota={nota}
              arrastrable
              editable
              contenedorRef={contenedorRef}
              onActualizada={actualizarNotaLocal}
              onBorrada={borrarNotaLocal}
            />
          ))}
          {estampas.map((estampa) => (
            <EstampaPeel key={estampa.id} estampa={estampa} arrastrable contenedorRef={contenedorRef} />
          ))}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {notas.length === 0 && estampas.length === 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">
              {editable
                ? "Agrega notas desde tu celular — en pantallas grandes puedes arrastrarlas."
                : "Todavía no hay nada en este mural."}
            </p>
          )}
          {notas.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {notas.map((nota) => (
                <NotaAdhesiva
                  key={nota.id}
                  nota={nota}
                  arrastrable={false}
                  editable={editable}
                  contenedorRef={contenedorRef}
                  onActualizada={actualizarNotaLocal}
                  onBorrada={borrarNotaLocal}
                />
              ))}
            </div>
          )}
          {estampas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {estampas.map((estampa) => (
                <EstampaPeel key={estampa.id} estampa={estampa} arrastrable={false} contenedorRef={contenedorRef} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
