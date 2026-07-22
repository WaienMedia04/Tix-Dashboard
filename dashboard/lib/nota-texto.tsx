import type { ReactNode } from "react";

/**
 * Marcado mínimo propio (no HTML, no `dangerouslySetInnerHTML`): `**negrita**`
 * y `_cursiva_`. Sin riesgo de inyección porque solo reconocemos estos dos
 * patrones literales y todo lo demás se renderiza como texto plano.
 */
export function renderizarTextoNota(texto: string): ReactNode[] {
  const partes = texto.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).filter((p) => p !== "");
  return partes.map((parte, i) => {
    if (parte.startsWith("**") && parte.endsWith("**") && parte.length > 4) {
      return <strong key={i}>{parte.slice(2, -2)}</strong>;
    }
    if (parte.startsWith("_") && parte.endsWith("_") && parte.length > 2) {
      return <em key={i}>{parte.slice(1, -1)}</em>;
    }
    return parte;
  });
}
