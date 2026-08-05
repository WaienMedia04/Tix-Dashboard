import {
  BookOpen,
  Brain,
  Calendar,
  Crown,
  FileText,
  Flame,
  Gift,
  GraduationCap,
  Handshake,
  Heart,
  Lightbulb,
  Megaphone,
  MessageCircle,
  PartyPopper,
  Rocket,
  Star,
  Sunrise,
  ThumbsUp,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Resolver de íconos para contenido que vive en catálogos del backend
 * (logros, misiones, reconocimientos rápidos, títulos de la tienda) — en vez
 * de emoji, esos catálogos guardan una clave de este mapa (ej. "trophy") y
 * acá se resuelve al componente de Lucide real. Las claves deben coincidir
 * con las que usan src/logros/logros.constant.ts, src/misiones/misiones.constant.ts,
 * src/mural/reconocimiento-rapido.constant.ts y src/tienda/tienda.constant.ts.
 */
const ICONOS_CATALOGO: Record<string, LucideIcon> = {
  "party-popper": PartyPopper,
  "file-text": FileText,
  flame: Flame,
  zap: Zap,
  "book-open": BookOpen,
  trophy: Trophy,
  "message-circle": MessageCircle,
  handshake: Handshake,
  lightbulb: Lightbulb,
  sunrise: Sunrise,
  gift: Gift,
  brain: Brain,
  megaphone: Megaphone,
  calendar: Calendar,
  star: Star,
  "thumbs-up": ThumbsUp,
  rocket: Rocket,
  heart: Heart,
  "graduation-cap": GraduationCap,
  crown: Crown,
};

/** Tonos elegantes y apagados (mismo estilo que los íconos del Dock) — uno por clave, para que el catálogo no se vea monocromático. */
const COLORES_CATALOGO: Record<string, string> = {
  "party-popper": "#E092B4",
  "file-text": "#8FB4E0",
  flame: "#E3966B",
  zap: "#E6C687",
  "book-open": "#8FD3C4",
  trophy: "#D9B36C",
  "message-circle": "#9C9CE8",
  handshake: "#9BD1A8",
  lightbulb: "#EAD07A",
  sunrise: "#E3AD8C",
  gift: "#D293D6",
  brain: "#B79AE6",
  megaphone: "#87C4D6",
  calendar: "#7FA8D9",
  star: "#E8CB6E",
  "thumbs-up": "#A8D8A0",
  rocket: "#E8A0AC",
  heart: "#E0919E",
  "graduation-cap": "#A88FD4",
  crown: "#E0BE6B",
};

const COLOR_POR_DEFECTO = "#E8CB6E";

/**
 * Componente (no una función que devuelve un componente) a propósito: el
 * lint de React Compiler prohíbe resolver un componente dinámico y guardarlo
 * en una variable dentro del cuerpo de otro componente ("no crear
 * componentes durante el render"). Envolviendo la resolución acá adentro, la
 * clave dinámica queda como un prop normal en vez de una variable-componente.
 */
export function IconoCatalogo({ id, className }: { id: string; className?: string }) {
  const Icono = ICONOS_CATALOGO[id] ?? Star;
  return <Icono className={className} style={{ color: COLORES_CATALOGO[id] ?? COLOR_POR_DEFECTO }} />;
}
