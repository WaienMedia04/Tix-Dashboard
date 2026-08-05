"use client";

import { useEffect, useState } from "react";
import {
  type CatalogoTienda,
  type ItemMarcoTienda,
  type ItemTituloTienda,
  comprarItemTienda,
  equiparItemTienda,
  fetchTiendaCatalogo,
} from "@/lib/api";
import { Modal } from "@/components/Modal";
import { clasesMarco } from "@/lib/tienda-catalogo";

function BotonItem({
  item,
  onComprar,
  onEquipar,
  cargando,
}: {
  item: ItemMarcoTienda | ItemTituloTienda;
  onComprar: () => void;
  onEquipar: () => void;
  cargando: boolean;
}) {
  if (!item.comprado) {
    return (
      <button
        onClick={onComprar}
        disabled={cargando}
        className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        🪙 {item.precio}
      </button>
    );
  }
  if (item.equipado) {
    return (
      <button
        onClick={onEquipar}
        disabled={cargando}
        className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        Quitar
      </button>
    );
  }
  return (
    <button
      onClick={onEquipar}
      disabled={cargando}
      className="shrink-0 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
    >
      Equipar
    </button>
  );
}

export function TiendaModal({
  open,
  onClose,
  onCambio,
}: {
  open: boolean;
  onClose: () => void;
  onCambio: (marcoId: string | null, tituloId: string | null) => void;
}) {
  const [catalogo, setCatalogo] = useState<CatalogoTienda | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetchTiendaCatalogo()
      .then(setCatalogo)
      .catch(() => {});
  }, [open]);

  function aplicar(nuevo: CatalogoTienda) {
    setCatalogo(nuevo);
    onCambio(
      nuevo.marcos.find((m) => m.equipado)?.id ?? null,
      nuevo.titulos.find((t) => t.equipado)?.id ?? null,
    );
  }

  async function comprar(itemId: string) {
    if (procesando) return;
    setProcesando(itemId);
    try {
      aplicar(await comprarItemTienda(itemId));
    } catch {
      // el usuario puede reintentar
    } finally {
      setProcesando(null);
    }
  }

  async function equipar(tipo: "marco" | "titulo", itemId: string, yaEquipado: boolean) {
    if (procesando) return;
    setProcesando(itemId);
    try {
      aplicar(await equiparItemTienda(tipo, yaEquipado ? null : itemId));
    } catch {
      // el usuario puede reintentar
    } finally {
      setProcesando(null);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Tienda" size="lg">
      {catalogo === null ? (
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      ) : (
        <div className="space-y-6">
          <p className="text-sm font-semibold text-foreground">🪙 {catalogo.monedas} monedas disponibles</p>

          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Marcos para tu carnet
            </p>
            <div className="space-y-2">
              {catalogo.marcos.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted ${clasesMarco(m.id)}`}>
                    <span className="h-6 w-6 rounded-full bg-card" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{m.nombre}</span>
                  <BotonItem
                    item={m}
                    cargando={procesando === m.id}
                    onComprar={() => void comprar(m.id)}
                    onEquipar={() => void equipar("marco", m.id, m.equipado)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Títulos junto a tu nombre
            </p>
            <div className="space-y-2">
              {catalogo.titulos.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{t.texto}</span>
                  <BotonItem
                    item={t}
                    cargando={procesando === t.id}
                    onComprar={() => void comprar(t.id)}
                    onEquipar={() => void equipar("titulo", t.id, t.equipado)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
