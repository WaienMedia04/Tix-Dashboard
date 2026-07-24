/** IDs deben coincidir exactamente con MASCOTA_IDS en el backend (src/mural/mural-mascota.constant.ts) y con los subpaths del paquete clippyjs. */
export interface MascotaMural {
  id: string;
  label: string;
}

export const MASCOTAS_MURAL: MascotaMural[] = [
  { id: "clippy", label: "Clippy" },
  { id: "bonzi", label: "Bonzi" },
  { id: "f1", label: "F1" },
  { id: "genie", label: "Genio" },
  { id: "genius", label: "Genius" },
  { id: "links", label: "Links" },
  { id: "merlin", label: "Merlín" },
  { id: "peedy", label: "Peedy" },
  { id: "rocky", label: "Rocky" },
  { id: "rover", label: "Rover" },
];
