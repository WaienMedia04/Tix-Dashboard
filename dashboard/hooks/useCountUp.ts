"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

const PATRON_NUMERO = /^-?\d+(\.\d+)?/;

export function useCountUp(valorTexto: string, duracionSegundos = 0.6): string {
  const reducirMovimiento = useReducedMotion();
  const animable = !reducirMovimiento && PATRON_NUMERO.test(valorTexto);
  const [mostrado, setMostrado] = useState(valorTexto);

  useEffect(() => {
    if (!animable) return;
    const match = PATRON_NUMERO.exec(valorTexto);
    if (!match) return;

    const objetivo = parseFloat(match[0]);
    const sufijo = valorTexto.slice(match[0].length);
    const decimales = match[1] ? match[1].length - 1 : 0;

    const controles = animate(0, objetivo, {
      duration: duracionSegundos,
      ease: "easeOut",
      onUpdate: (v) => setMostrado(`${v.toFixed(decimales)}${sufijo}`),
    });

    return () => controles.stop();
  }, [valorTexto, duracionSegundos, animable]);

  return animable ? mostrado : valorTexto;
}
