const NIVEL_MAXIMO = 60;

/** Nombre del rango de nivel — coincide con los hitos del documento de producto (1, 5, 10, 20, 30, 50). */
const NOMBRES_NIVEL: { desde: number; nombre: string }[] = [
  { desde: 1, nombre: 'Aprendiz' },
  { desde: 5, nombre: 'Colaborador' },
  { desde: 10, nombre: 'Experto' },
  { desde: 20, nombre: 'Mentor' },
  { desde: 30, nombre: 'Líder' },
  { desde: 50, nombre: 'Leyenda' },
];

export function nombreNivel(nivel: number): string {
  let nombre = NOMBRES_NIVEL[0].nombre;
  for (const n of NOMBRES_NIVEL) {
    if (nivel >= n.desde) nombre = n.nombre;
  }
  return nombre;
}

/** XP necesaria para subir del nivel `nivel` al siguiente — crece progresivamente para que los niveles altos cuesten más. */
function xpParaSubir(nivel: number): number {
  return Math.round(50 * Math.pow(nivel, 1.35));
}

export interface InfoNivel {
  nivel: number;
  nombreNivel: string;
  xpTotal: number;
  xpNivelActual: number;
  xpParaSiguienteNivel: number;
  porcentaje: number;
  esNivelMaximo: boolean;
}

export function calcularNivel(xpTotal: number): InfoNivel {
  let nivel = 1;
  let restante = xpTotal;
  while (nivel < NIVEL_MAXIMO) {
    const requerido = xpParaSubir(nivel);
    if (restante < requerido) break;
    restante -= requerido;
    nivel++;
  }

  const esNivelMaximo = nivel >= NIVEL_MAXIMO;
  const xpParaSiguienteNivel = esNivelMaximo ? 0 : xpParaSubir(nivel);

  return {
    nivel,
    nombreNivel: nombreNivel(nivel),
    xpTotal,
    xpNivelActual: restante,
    xpParaSiguienteNivel,
    porcentaje: esNivelMaximo
      ? 100
      : Math.min(100, Math.round((restante / xpParaSiguienteNivel) * 100)),
    esNivelMaximo,
  };
}
