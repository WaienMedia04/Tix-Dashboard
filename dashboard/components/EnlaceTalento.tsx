"use client";

import Link from "next/link";
import { usePanel } from "./panel/PanelContext";

/**
 * Nombre de un talento como acceso directo a su ficha de perfil
 * (/[slug]/empleados/[talentoId]). Detiene la propagación del click porque
 * casi siempre vive dentro de una fila/tarjeta que también tiene su propio
 * onClick (abrir un modal de detalle, etc.) — sin esto, el click en el
 * nombre además dispararía esa acción del contenedor.
 */
export function EnlaceTalento({
  talentoId,
  children,
  className = "hover:text-primary hover:underline",
}: {
  talentoId: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { slug } = usePanel();
  return (
    <Link href={`/${slug}/empleados/${talentoId}`} onClick={(e) => e.stopPropagation()} className={className}>
      {children}
    </Link>
  );
}
