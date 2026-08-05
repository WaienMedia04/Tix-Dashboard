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

/**
 * Componente (no una función que devuelve un componente) a propósito: el
 * lint de React Compiler prohíbe resolver un componente dinámico y guardarlo
 * en una variable dentro del cuerpo de otro componente ("no crear
 * componentes durante el render"). Envolviendo la resolución acá adentro, la
 * clave dinámica queda como un prop normal en vez de una variable-componente.
 */
export function IconoCatalogo({ id, className }: { id: string; className?: string }) {
  const Icono = ICONOS_CATALOGO[id] ?? Star;
  return <Icono className={className} />;
}
