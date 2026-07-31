import {
  AlertOctagon,
  AlertTriangle,
  CalendarX,
  Clock,
  FileCheck2,
  FileText,
  HeartHandshake,
  PartyPopper,
  Sparkles,
  StickyNote,
  ThumbsUp,
  Trophy,
} from "lucide-react";
import type { TipoNovedad } from "./api";

export const TIPOS_NOVEDAD: {
  valor: TipoNovedad;
  label: string;
  icon: typeof Trophy;
  texto: string;
  fondo: string;
}[] = [
  { valor: "LOGRO", label: "Logro", icon: Trophy, texto: "text-success", fondo: "bg-success/10" },
  { valor: "EXITO", label: "Éxito", icon: Sparkles, texto: "text-success", fondo: "bg-success/10" },
  { valor: "BUENA_ACCION", label: "Buena acción", icon: HeartHandshake, texto: "text-success", fondo: "bg-success/10" },
  { valor: "COSA_BUENA", label: "Cosa buena", icon: ThumbsUp, texto: "text-success", fondo: "bg-success/10" },
  { valor: "TARDANZA", label: "Tardanza", icon: Clock, texto: "text-warning", fondo: "bg-warning/10" },
  { valor: "AUSENCIA", label: "Ausencia", icon: CalendarX, texto: "text-warning", fondo: "bg-warning/10" },
  { valor: "PERMISO", label: "Permiso", icon: FileCheck2, texto: "text-info", fondo: "bg-info/10" },
  { valor: "NO_CUMPLIMIENTO", label: "No cumplimiento", icon: AlertTriangle, texto: "text-destructive", fondo: "bg-destructive/10" },
  { valor: "ERROR", label: "Error", icon: AlertOctagon, texto: "text-destructive", fondo: "bg-destructive/10" },
  { valor: "SITUACION", label: "Situación", icon: FileText, texto: "text-info", fondo: "bg-info/10" },
  { valor: "EVENTO", label: "Evento", icon: PartyPopper, texto: "text-primary", fondo: "bg-primary/10" },
  { valor: "NOTA", label: "Nota", icon: StickyNote, texto: "text-muted-foreground", fondo: "bg-muted" },
];

export function metaTipoNovedad(tipo: TipoNovedad) {
  return TIPOS_NOVEDAD.find((t) => t.valor === tipo) ?? TIPOS_NOVEDAD[TIPOS_NOVEDAD.length - 1];
}
