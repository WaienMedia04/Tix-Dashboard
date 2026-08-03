"use client";

import { useEffect } from "react";

/**
 * Solo se activa si el error ocurre en el root layout mismo (fuera del
 * alcance de app/error.tsx) — reemplaza <html>/<body> por completo, así que
 * no puede depender de globals.css/ThemeProvider: todo acá es autocontenido.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body style={{ margin: 0, background: "#09090b", color: "#fafafa", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div
            style={{
              maxWidth: 360,
              textAlign: "center",
              borderRadius: 12,
              border: "1px solid #27272a",
              background: "#18181b",
              padding: 32,
            }}
          >
            <p style={{ fontSize: 18, fontWeight: 600 }}>TalentiX RD</p>
            <p style={{ marginTop: 12, fontSize: 14 }}>Ocurrió un error inesperado cargando la aplicación.</p>
            <button
              onClick={reset}
              style={{
                marginTop: 16,
                borderRadius: 6,
                background: "#fafafa",
                color: "#18181b",
                border: "none",
                padding: "8px 16px",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
