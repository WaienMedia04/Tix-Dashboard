/** Sonidos sintetizados con Web Audio API — sin archivos de audio externos que cargar. */

function contextoAudio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  return new Ctor();
}

function tono(ctx: AudioContext, frecuencia: number, inicio: number, duracion: number, volumen = 0.1) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = frecuencia;
  gain.gain.setValueAtTime(0, ctx.currentTime + inicio);
  gain.gain.linearRampToValueAtTime(volumen, ctx.currentTime + inicio + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + inicio + duracion);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + inicio);
  osc.stop(ctx.currentTime + inicio + duracion + 0.05);
}

/**
 * Campanada suave de bienvenida (dos notas ascendentes) — una sola vez por
 * pestaña/sesión de navegador, para no repetirla cada vez que se navega
 * dentro del mural.
 */
export function reproducirSonidoEntrada() {
  try {
    if (sessionStorage.getItem("tx_sonido_entrada")) return;
    sessionStorage.setItem("tx_sonido_entrada", "1");
    const ctx = contextoAudio();
    if (!ctx) return;
    tono(ctx, 587.33, 0, 0.35);
    tono(ctx, 880, 0.12, 0.4);
  } catch {
    // el sonido es decorativo — si algo falla, simplemente no suena
  }
}
