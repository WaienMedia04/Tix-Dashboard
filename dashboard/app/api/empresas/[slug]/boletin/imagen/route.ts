import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { exigirRolAdministrativo } from "@/lib/server-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        await exigirRolAdministrativo(request);
        return {
          allowedContentTypes: ["image/png", "image/jpeg", "image/webp"],
          maximumSizeInBytes: 5 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[api/empresas/[slug]/boletin/imagen] subida rechazada:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo procesar la subida" },
      { status: 401 },
    );
  }
}
