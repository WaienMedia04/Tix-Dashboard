"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { ZoomIn } from "lucide-react";
import { recortarImagen } from "@/lib/recortar-imagen";
import { Modal } from "@/components/Modal";

export function AjustarFotoModal({
  imagenSrc,
  onCancelar,
  onGuardar,
}: {
  imagenSrc: string;
  onCancelar: () => void;
  onGuardar: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [procesando, setProcesando] = useState(false);

  const onCropComplete = useCallback((_area: Area, areaPixelesRecorte: Area) => {
    setAreaPixels(areaPixelesRecorte);
  }, []);

  async function confirmar() {
    if (!areaPixels) return;
    setProcesando(true);
    try {
      const blob = await recortarImagen(imagenSrc, areaPixels);
      onGuardar(blob);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <Modal open onClose={onCancelar} title="Ajustar foto" description="Arrastra y usa el zoom para encuadrar la foto.">
      <div className="relative h-72 w-full overflow-hidden rounded-md bg-muted sm:h-80">
        <Cropper
          image={imagenSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-primary"
          aria-label="Zoom"
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => void confirmar()}
          disabled={procesando || !areaPixels}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {procesando ? "Procesando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          disabled={procesando}
          className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
