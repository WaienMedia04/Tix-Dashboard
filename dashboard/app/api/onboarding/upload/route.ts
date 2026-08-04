import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const TIPOS_LOGO = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const TIPOS_ROSTER = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

/**
 * Subida pública (sin auth) para el formulario de onboarding — la empresa
 * todavía no existe, no hay sesión ni codigoAcceso que exigir. La única
 * protección es el allowlist de tipos/tamaño de archivo; el endpoint que
 * crea la solicitud (POST /onboarding) es el que lleva el rate-limit.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const esLogo = pathname.startsWith("onboarding/logo-");
        return {
          allowedContentTypes: esLogo ? TIPOS_LOGO : TIPOS_ROSTER,
          maximumSizeInBytes: (esLogo ? 8 : 15) * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[api/onboarding/upload] subida rechazada:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo procesar la subida" },
      { status: 400 },
    );
  }
}
