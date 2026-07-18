import { ImageResponse } from "next/og";

export const dynamic = "force-static";

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
          borderRadius: 108,
          color: "#fff",
          fontSize: 256,
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
