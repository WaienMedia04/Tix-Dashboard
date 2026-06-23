const ESTILOS: Record<string, string> = {
  enviada: "bg-success/10 text-success border-success/20",
  no_enviada: "bg-destructive/10 text-destructive border-destructive/20",
  permiso: "bg-warning/10 text-warning border-warning/20",
  default: "bg-muted text-muted-foreground border-border",
};

function claseParaEstado(estadoCrudo: string): string {
  if (estadoCrudo.includes("✅")) return ESTILOS.enviada;
  if (estadoCrudo.includes("❌")) return ESTILOS.no_enviada;
  if (estadoCrudo.includes("📋")) return ESTILOS.permiso;
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
