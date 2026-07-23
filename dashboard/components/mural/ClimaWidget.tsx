"use client";

import type { HTMLAttributes } from "react";
import Script from "next/script";

const CONFIG_WIDGET = JSON.stringify({
  t: "horizontal",
  lang: "es",
  sl_lpl: 1,
  ids: [],
  font: "Arial",
  sl_ics: "one_a",
  sl_sot: "celsius",
  cl_bkg: "image",
  cl_font: "#FFFFFF",
  cl_cloud: "#FFFFFF",
  cl_persp: "#81D4FA",
  cl_sun: "#FFC107",
  cl_moon: "#FFC107",
  cl_thund: "#FF5722",
});

// El script de weatherwidget.org lee su configuración de atributos propios
// (v/loc/a) sobre el div con este id — no son atributos HTML estándar, así
// que TypeScript no los reconoce en el tipo de <div>.
const atributosWidget = {
  v: "1.3",
  loc: "auto",
  a: CONFIG_WIDGET,
} as unknown as HTMLAttributes<HTMLDivElement>;

/** Widget de clima (weatherwidget.org) — flota en la esquina superior derecha del mural. */
export function ClimaWidget() {
  return (
    <>
      <div id="ww_f41a6dcd1a6dc" {...atributosWidget}>
        Más previsiones:{" "}
        <a
          href="https://tiempolargo.com/buenos_aires_tiempo_25_dias/"
          id="ww_f41a6dcd1a6dc_u"
          target="_blank"
          rel="noreferrer"
        >
          Tiempo en Buenos Aires 25 días
        </a>
      </div>
      <Script async src="https://app3.weatherwidget.org/js/?id=ww_f41a6dcd1a6dc" strategy="lazyOnload" />
    </>
  );
}
