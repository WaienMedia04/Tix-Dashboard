import type { Area } from "react-easy-crop";

function cargarImagen(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Recorta `areaPixels` de la imagen en `imageSrc` y la reescala a un cuadrado de `outputSize`. */
export async function recortarImagen(imageSrc: string, areaPixels: Area, outputSize = 512): Promise<Blob> {
  const imagen = await cargarImagen(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo preparar el recorte de la imagen");

  ctx.drawImage(
    imagen,
    areaPixels.x,
    areaPixels.y,
    areaPixels.width,
    areaPixels.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo generar la imagen recortada"))),
      "image/jpeg",
      0.92,
    );
  });
}
