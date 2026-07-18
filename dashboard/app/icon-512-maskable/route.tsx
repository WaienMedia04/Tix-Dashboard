import { ImageResponse } from "next/og";

export const dynamic = "force-static";

// Maskable: el sistema recorta esto en distintas formas (círculo, squircle,
// etc), así que el fondo llega hasta el borde y el contenido se mantiene
// dentro de la "zona segura" central (~80%) para no perder nada al recortar.
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #22D3EE 0%, #8B5CF6 55%, #D946EF 100%)",
          color: "#fff",
          fontSize: 180,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        TX
      </div>
    ),
    { width: 512, height: 512 },
  );
}
