const ESTILOS: Record<string, string> = {
  enviada: "bg-success/15 text-success border-success/30",
  no_enviada: "bg-danger/15 text-danger border-danger/30",
  permiso: "bg-accent/15 text-accent border-accent/30",
  default: "bg-surface-border text-muted border-surface-border",
};

function claseParaEstado(estado: string): string {
  if (estado.includes("✅")) return ESTILOS.enviada;
  if (estado.includes("❌")) return ESTILOS.no_enviada;
  if (estado.includes("📋")) return ESTILOS.permiso;
  return ESTILOS.default;
}

export function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${claseParaEstado(estado)}`}
    >
      {estado}
    </span>
  );
}
