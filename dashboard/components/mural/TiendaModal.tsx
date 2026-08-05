"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Circle, CloudRain, Crown, Lock, ShoppingBag, Sparkles, Tag, Type, X } from "lucide-react";
import {
  type CatalogoTienda,
  type ItemFondoTienda,
  type ItemMarcoTienda,
  type ItemTituloTienda,
  type RarezaItemTienda,
  type TipoItemTienda,
  comprarItemTienda,
  equiparItemTienda,
  fetchTiendaCatalogo,
} from "@/lib/api";
import { clasesMarco } from "@/lib/tienda-catalogo";
import { fondoMuralCss, FONDOS_LLUVIA_IDS } from "@/lib/mural-fondos";
import { ESTILO_RAREZA, ordenarPorRareza } from "@/lib/rareza-tienda";

type Categoria = "marco" | "titulo" | "fondo";
type ItemCualquiera = ItemMarcoTienda | ItemTituloTienda | ItemFondoTienda;

const CATEGORIAS: { valor: Categoria; etiqueta: string; icono: React.ReactNode }[] = [
  { valor: "marco", etiqueta: "Marcos", icono: <Circle className="h-3.5 w-3.5" /> },
  { valor: "titulo", etiqueta: "Títulos", icono: <Type className="h-3.5 w-3.5" /> },
  { valor: "fondo", etiqueta: "Fondos", icono: <Sparkles className="h-3.5 w-3.5" /> },
];

const RAREZAS_EN_ORDEN: RarezaItemTienda[] = ["legendario", "epico", "raro", "comun"];

function VistaPrevia({ categoria, item }: { categoria: Categoria; item: ItemCualquiera }) {
  if (categoria === "marco") {
    return (
      <div className="flex h-16 items-center justify-center">
        <span className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-white/15 to-white/5 ${clasesMarco(item.id)}`}>
          <span className="h-6 w-6 rounded-full bg-white/20" />
        </span>
      </div>
    );
  }
  if (categoria === "titulo") {
    const t = item as ItemTituloTienda;
    return (
      <div className="flex h-16 items-center justify-center px-2">
        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-center text-xs font-semibold text-white">
          {t.texto}
        </span>
      </div>
    );
  }
  const f = item as ItemFondoTienda;
  const esLluvia = (FONDOS_LLUVIA_IDS as readonly string[]).includes(f.id);
  return (
    <div className="relative h-16 overflow-hidden rounded-lg" style={{ background: fondoMuralCss(f.id) }}>
      {esLluvia && (
        <span className="absolute right-1.5 bottom-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
          <CloudRain className="h-3 w-3 text-white/90" />
        </span>
      )}
    </div>
  );
}

function BotonAccion({
  item,
  categoria,
  monedas,
  cargando,
  onComprar,
  onEquipar,
}: {
  item: ItemCualquiera;
  categoria: Categoria;
  monedas: number;
  cargando: boolean;
  onComprar: () => void;
  onEquipar: () => void;
}) {
  if (!item.comprado) {
    const alcanza = monedas >= item.precio;
    return (
      <button
        onClick={onComprar}
        disabled={cargando || !alcanza}
        title={alcanza ? undefined : "No te alcanzan las monedas"}
        className="flex w-full items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 py-1.5 text-xs font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        🪙 {item.precio}
      </button>
    );
  }
  if (item.equipado) {
    // Un fondo siempre tiene que tener alguno puesto — no existe "sin fondo", así que no se puede quitar, solo cambiar por otro.
    if (categoria === "fondo") {
      return (
        <span className="flex w-full items-center justify-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 py-1.5 text-[11px] font-semibold text-emerald-300">
          Equipado
        </span>
      );
    }
    return (
      <button
        onClick={onEquipar}
        disabled={cargando}
        className="w-full rounded-lg border border-white/10 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Quitar
      </button>
    );
  }
  return (
    <button
      onClick={onEquipar}
      disabled={cargando}
      className="w-full rounded-lg bg-emerald-500/90 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Equipar
    </button>
  );
}

function TarjetaItem({
  categoria,
  item,
  monedas,
  cargando,
  onComprar,
  onEquipar,
}: {
  categoria: Categoria;
  item: ItemCualquiera;
  monedas: number;
  cargando: boolean;
  onComprar: () => void;
  onEquipar: () => void;
}) {
  const estilo = ESTILO_RAREZA[item.rareza];
  const nombre = "nombre" in item ? item.nombre : (item as ItemTituloTienda).texto;

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border bg-white/[0.03] p-2.5 transition-colors ${estilo.borde} ${
        item.equipado ? estilo.resplandor : ""
      }`}
    >
      <div className="relative">
        {!item.comprado && (
          <span className="absolute top-1 right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
            <Lock className="h-2.5 w-2.5 text-white/70" />
          </span>
        )}
        <VistaPrevia categoria={categoria} item={item} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-center text-xs font-semibold text-white">{nombre}</p>
        <p className={`text-center text-[10px] font-medium tracking-wide uppercase ${estilo.texto}`}>{estilo.etiqueta}</p>
      </div>
      <BotonAccion
        item={item}
        categoria={categoria}
        monedas={monedas}
        cargando={cargando}
        onComprar={onComprar}
        onEquipar={onEquipar}
      />
    </div>
  );
}

export function TiendaModal({
  open,
  onClose,
  onCambio,
}: {
  open: boolean;
  onClose: () => void;
  onCambio: (marcoId: string | null, tituloId: string | null, fondoId: string | null) => void;
}) {
  const [catalogo, setCatalogo] = useState<CatalogoTienda | null>(null);
  const [categoria, setCategoria] = useState<Categoria>("marco");
  const [procesando, setProcesando] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetchTiendaCatalogo()
      .then(setCatalogo)
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open, onClose]);

  function aplicar(nuevo: CatalogoTienda) {
    setCatalogo(nuevo);
    onCambio(
      nuevo.marcos.find((m) => m.equipado)?.id ?? null,
      nuevo.titulos.find((t) => t.equipado)?.id ?? null,
      nuevo.fondos.find((f) => f.equipado)?.id ?? null,
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

  async function equipar(tipo: TipoItemTienda, itemId: string, yaEquipado: boolean) {
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

  const itemsCategoria: ItemCualquiera[] = useMemo(() => {
    if (!catalogo) return [];
    if (categoria === "marco") return catalogo.marcos;
    if (categoria === "titulo") return catalogo.titulos;
    return catalogo.fondos;
  }, [catalogo, categoria]);

  const gruposPorRareza = useMemo(() => {
    const ordenados = ordenarPorRareza(itemsCategoria);
    return RAREZAS_EN_ORDEN.map((r) => ({ rareza: r, items: ordenados.filter((i) => i.rareza === r) })).filter(
      (g) => g.items.length > 0,
    );
  }, [itemsCategoria]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#17171f] to-[#0b0b10] shadow-2xl"
          >
            {/* Cabecera */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                  <ShoppingBag className="h-4.5 w-4.5 text-white" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold tracking-tight text-white">Tienda TalentiX</h2>
                  <p className="truncate text-[11px] text-white/50">Personaliza tu carnet, tu nombre y tu mural</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-sm font-bold text-amber-300">
                  🪙 {catalogo?.monedas ?? "…"}
                </span>
                <button
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Pestañas de categoría */}
            <div className="flex shrink-0 gap-1 border-b border-white/10 px-5 py-2.5">
              {CATEGORIAS.map((c) => {
                const cantidad =
                  catalogo && (c.valor === "marco" ? catalogo.marcos.length : c.valor === "titulo" ? catalogo.titulos.length : catalogo.fondos.length);
                return (
                  <button
                    key={c.valor}
                    onClick={() => setCategoria(c.valor)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      categoria === c.valor
                        ? "bg-gradient-to-r from-violet-500/25 to-indigo-500/15 text-white"
                        : "text-white/50 hover:bg-white/5 hover:text-white/80"
                    }`}
                  >
                    {c.icono}
                    {c.etiqueta}
                    {typeof cantidad === "number" && <span className="text-[10px] text-white/40">{cantidad}</span>}
                  </button>
                );
              })}
            </div>

            {/* Catálogo */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {catalogo === null ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-36 animate-pulse rounded-xl bg-white/5" />
                  ))}
                </div>
              ) : (
                <div className="space-y-5">
                  {gruposPorRareza.map(({ rareza, items }) => {
                    const estilo = ESTILO_RAREZA[rareza];
                    return (
                      <div key={rareza}>
                        <div className="mb-2 flex items-center gap-2">
                          <Crown className={`h-3 w-3 ${estilo.texto}`} />
                          <p className={`text-[11px] font-bold tracking-wider uppercase ${estilo.texto}`}>{estilo.etiqueta}</p>
                          <div className="h-px flex-1 bg-white/10" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {items.map((item) => (
                            <TarjetaItem
                              key={item.id}
                              categoria={categoria}
                              item={item}
                              monedas={catalogo.monedas}
                              cargando={procesando === item.id}
                              onComprar={() => void comprar(item.id)}
                              onEquipar={() => void equipar(categoria, item.id, item.equipado)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-white/10 px-5 py-2.5">
              <p className="flex items-center gap-1.5 text-[11px] text-white/40">
                <Tag className="h-3 w-3" />
                Ganas monedas completando misiones, bitácoras, reconocimientos y más.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
