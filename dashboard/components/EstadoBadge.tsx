const ESTILOS: Record<string, string> = {
  enviada: "bg-success/10 text-success border-success/20",
  no_enviada: "bg-destructive/10 text-destructive border-destructive/20",
  pendiente: "bg-warning/10 text-warning border-warning/20",
  permiso: "bg-info/10 text-info border-info/20",
  licencia: "bg-neutral/10 text-neutral border-neutral/20",
  default: "bg-muted text-muted-foreground border-border",
};

function claseParaEstado(estadoCrudo: string): string {
  const texto = estadoCrudo.toLowerCase();
  if (estadoCrudo.includes("✅")) return ESTILOS.enviada;
  if (estadoCrudo.includes("❌")) return ESTILOS.no_enviada;
  if (estadoCrudo.includes("📋") || texto.includes("permiso")) return ESTILOS.permiso;
  if (texto.includes("licencia")) return ESTILOS.licencia;
  if (texto.includes("pendiente")) return ESTILOS.pendiente;
  return ESTILOS.default;
}

function limpiarTexto(estadoCrudo: string): string {
  return estadoCrudo.replace(/[✅❌📋]/g, "").trim();
}

export function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${claseParaEstado(estado)}`}
    >
      {limpiarTexto(estado)}
    </span>
  );
}
