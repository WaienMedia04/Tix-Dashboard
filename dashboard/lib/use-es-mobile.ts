import { useEffect, useState } from "react";

/**
 * true por debajo del breakpoint `lg` de Tailwind (1024px) — cubre
 * celulares y la mayoría de tablets en vertical. Empieza en `false`
 * (asume escritorio) para no romper la hidratación del servidor; se
 * corrige solo apenas monta en el cliente.
 */
export function useEsMobile(breakpointPx = 1024): boolean {
  const [esMobile, setEsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setEsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpointPx]);

  return esMobile;
}
