"use client";

import type { EfectoCanvasFondo } from "@/lib/mural-fondos";
import { CintaAmbientalFondo } from "./CintaAmbientalFondo";
import { LluviaDigitalFondo } from "./LluviaDigitalFondo";
import { OndaHexagonalFondo } from "./OndaHexagonalFondo";
import { LineasLiquidasFondo } from "./LineasLiquidasFondo";
import { RielesNeonFondo } from "./RielesNeonFondo";
import { EstelaEstelarFondo } from "./EstelaEstelarFondo";

/** Resuelve qué componente de canvas renderizar para un fondo con efecto propio (ver efectoCanvasFondo en mural-fondos.ts). */
export function EfectoCanvasFondoRender({ efecto }: { efecto: EfectoCanvasFondo }) {
  if (efecto === "cinta_ambiental") return <CintaAmbientalFondo />;
  if (efecto === "lluvia_digital") return <LluviaDigitalFondo />;
  if (efecto === "onda_hexagonal") return <OndaHexagonalFondo />;
  if (efecto === "lineas_liquidas") return <LineasLiquidasFondo />;
  if (efecto === "rieles_neon") return <RielesNeonFondo />;
  return <EstelaEstelarFondo />;
}
