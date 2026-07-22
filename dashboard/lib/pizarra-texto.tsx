import type { ReactNode } from "react";

const REGEX_MENCION = /@\[([^\]]+)\]\(([a-zA-Z0-9_-]+)\)/g;

/** Encierra el nombre elegido del autocompletado en el token que el backend reconoce como mención. */
export function codificarMencion(nombre: string, usuarioId: string): string {
  return `@[${nombre}](${usuarioId})`;
}

/**
 * Convierte `@[Nombre](usuarioId)` en texto resaltado — no se resuelve
 * ningún link, solo se le da estilo distinto al nombre mencionado.
 */
export function renderizarTextoPizarra(texto: string): ReactNode[] {
  const partes: ReactNode[] = [];
  let ultimo = 0;
  let i = 0;
  REGEX_MENCION.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = REGEX_MENCION.exec(texto)) !== null) {
    if (match.index > ultimo) {
      partes.push(texto.slice(ultimo, match.index));
    }
    partes.push(
      <span key={`m${i++}`} className="font-semibold text-primary">
        @{match[1]}
      </span>,
    );
    ultimo = match.index + match[0].length;
  }
  if (ultimo < texto.length) {
    partes.push(texto.slice(ultimo));
  }
  return partes;
}
