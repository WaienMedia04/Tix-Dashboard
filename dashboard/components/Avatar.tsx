function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

const TAMANOS = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-xs",
  lg: "h-14 w-14 text-base",
  xl: "h-24 w-24 text-2xl",
} as const;

export function Avatar({
  nombreCompleto,
  fotoUrl,
  size = "md",
  className = "",
}: {
  nombreCompleto: string;
  fotoUrl?: string | null;
  size?: keyof typeof TAMANOS;
  className?: string;
}) {
  const clases = `flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold ${TAMANOS[size]} ${className}`;

  if (fotoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- avatares vienen de Vercel Blob, URL dinámica por talento.
    return <img src={fotoUrl} alt={nombreCompleto} className={`${clases} object-cover`} />;
  }

  return (
    <span className={`${clases} bg-gradient-primary text-white`} aria-hidden="true">
      {iniciales(nombreCompleto)}
    </span>
  );
}
