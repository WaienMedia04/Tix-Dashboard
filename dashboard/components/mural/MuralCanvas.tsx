"use client";

import { StickyNote } from "lucide-react";
import { type EstampaOtorgadaMural, type NotaMural, crearNotaMural } from "@/lib/api";
import { fondoMuralTexto } from "@/lib/mural-fondos";
import { useEsMobile } from "@/lib/use-es-mobile";
import { NotaAdhesiva } from "./NotaAdhesiva";
import { EstampaPeel } from "./EstampaPeel";

const COLORES_ALEATORIOS = ["amarillo", "rosa", "celeste", "verde", "lila", "naranja", "menta", "gris"];

export function MuralCanvas({
  notas,
  estampas,
  editable,
  fondoId,
  contenedorRef,
  onNotasChange,
}: {
  notas: NotaMural[];
  estampas: EstampaOtorgadaMural[];
  /** false cuando se está visitando el mural de otro empleado — solo lectura, sin drag. */
  editable: boolean;
  fondoId: string;
  /** Contenedor compartido con el resto del mural — así las notas/estampas se pueden soltar en cualquier parte de la página. */
  contenedorRef: React.RefObject<HTMLDivElement | null>;
  onNotasChange: (notas: NotaMural[]) => void;
}) {
  const esMobile = useEsMobile();
  const arrastrable = editable && !esMobile;
  const textoVacio = fondoMuralTexto(fondoId);

  async function agregarNota() {
    const color = COLORES_ALEATORIOS[Math.floor(Math.random() * COLORES_ALEATORIOS.length)];
    const posX = 10 + Math.random() * 70;
    const posY = 30 + Math.random() * 55;
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

  if (arrastrable) {
    return (
      <>
        {/* Espacio mínimo debajo del encabezado para que siempre haya dónde soltar algo,
            aunque el mural esté vacío — las notas/estampas pueden ir sobre cualquier
            parte del contenedor compartido, incluido el encabezado. */}
        <div className="min-h-[55vh] w-full" />

        {notas.length === 0 && estampas.length === 0 && (
          <p
            className="pointer-events-none absolute inset-x-0 top-[75%] px-4 text-center text-sm font-medium"
            style={{ color: textoVacio.color, textShadow: textoVacio.sombra }}
          >
            Tu mural está en blanco — agrega una nota o pide una estampa de regalo.
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

        {editable && (
          <button
            onClick={() => void agregarNota()}
            className="fixed right-5 bottom-5 z-30 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:scale-105"
          >
            <StickyNote className="h-4 w-4" />
            Nueva nota
          </button>
        )}
      </>
    );
  }

  return (
    <div className="px-4 pb-10">
      {notas.length === 0 && estampas.length === 0 && (
        <p
          className="py-10 text-center text-sm font-medium"
          style={{ color: textoVacio.color, textShadow: textoVacio.sombra }}
        >
          {editable ? "Agrega notas desde el botón de abajo." : "Todavía no hay nada en este mural."}
        </p>
      )}
      {notas.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
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
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {estampas.map((estampa) => (
            <EstampaPeel key={estampa.id} estampa={estampa} arrastrable={false} contenedorRef={contenedorRef} />
          ))}
        </div>
      )}
      {editable && (
        <button
          onClick={() => void agregarNota()}
          className="fixed right-5 bottom-5 z-30 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-elegant"
        >
          <StickyNote className="h-4 w-4" />
          Nueva nota
        </button>
      )}
    </div>
  );
}
