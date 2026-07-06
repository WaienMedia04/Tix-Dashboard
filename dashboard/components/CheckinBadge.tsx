"use client";

import { motion } from "framer-motion";

export function CheckinBadge({
  checkinEnviado,
  horaCheckin,
}: {
  checkinEnviado: boolean;
  horaCheckin: string | null;
}) {
  const clase = checkinEnviado
    ? "bg-success/10 text-success border-success/20"
    : "bg-muted text-muted-foreground border-border";

  return (
    <motion.span
      key={String(checkinEnviado)}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${clase}`}
    >
      {checkinEnviado ? `✅ ${horaCheckin ?? "enviado"}` : "— sin check-in"}
    </motion.span>
  );
}
