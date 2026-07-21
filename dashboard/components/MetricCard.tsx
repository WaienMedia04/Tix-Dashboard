"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

export interface MetricDelta {
  valor: string;
  direccion: "subida" | "bajada";
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  delta,
  variant = "default",
  bordered = true,
  onClick,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  delta?: MetricDelta;
  variant?: "default" | "primary";
  bordered?: boolean;
  onClick?: () => void;
}) {
  const valorAnimado = useCountUp(value);
  const primario = variant === "primary";
  const className = `h-full w-full select-none rounded-xl p-4 text-left shadow-card transition-shadow hover:shadow-elegant ${
    onClick ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" : ""
  } ${primario ? "bg-primary-dark text-primary-dark-foreground" : bordered ? "border border-border bg-card" : "bg-card"}`;

  const contenido = (
    <>
      <div className="flex items-start justify-between">
        <p
          className={`text-xs font-semibold tracking-wide uppercase ${
            primario ? "text-primary-dark-foreground/70" : "text-muted-foreground"
          }`}
        >
          {label}
        </p>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
            primario ? "bg-white/15 text-primary-dark-foreground" : "bg-accent text-accent-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p
        className={`font-display mt-2 text-2xl font-semibold tracking-tight tabular-nums ${
          primario ? "text-primary-dark-foreground" : "text-foreground"
        }`}
      >
        {valorAnimado}
      </p>
      {hint && (
        <p className={`mt-1 text-xs ${primario ? "text-primary-dark-foreground/70" : "text-muted-foreground"}`}>{hint}</p>
      )}
      {delta && (
        <span
          className={`mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
            primario
              ? "bg-white/15 text-primary-dark-foreground"
              : delta.direccion === "subida"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
          }`}
        >
          {delta.valor}
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={className}
      >
        {contenido}
      </motion.button>
    );
  }

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15, ease: "easeOut" }} className={className}>
      {contenido}
    </motion.div>
  );
}
