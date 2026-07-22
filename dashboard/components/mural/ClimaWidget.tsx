"use client";

import type { HTMLAttributes } from "react";
import Script from "next/script";

const CONFIG_WIDGET = JSON.stringify({
  t: "responsive",
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

/** Widget de clima (weatherwidget.org) — se muestra al final del mural. */
export function ClimaWidget() {
  return (
    <>
      <div id="ww_43af629b1bb" {...atributosWidget}>
        Más previsiones:{" "}
        <a
          href="https://tiempolargo.com/madrid_tiempo_25_dias/"
          id="ww_43af629b1bb_u"
          target="_blank"
          rel="noreferrer"
        >
          El tiempo para 25 días
        </a>
      </div>
      <Script async src="https://app3.weatherwidget.org/js/?id=ww_43af629b1bb" strategy="lazyOnload" />
    </>
  );
}
