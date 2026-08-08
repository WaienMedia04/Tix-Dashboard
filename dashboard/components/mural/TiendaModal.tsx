"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Circle,
  CloudRain,
  Coins,
  Crown,
  Frame,
  Lock,
  Palette,
  PawPrint,
  Search,
  ShoppingBag,
  Sparkles,
  Sticker,
  StickyNote,
  Tag,
  Type,
  X,
} from "lucide-react";
import {
  type CatalogoTienda,
  type ItemBordeNotaTienda,
  type ItemColorNombreTienda,
  type ItemEstampaTienda,
  type ItemFondoTienda,
  type ItemMarcoCuadroTienda,
  type ItemMarcoTienda,
  type ItemMascotaTienda,
  type ItemTituloTienda,
  type RarezaItemTienda,
  type TipoItemTienda,
  comprarItemTienda,
  equiparItemTienda,
  fetchTiendaCatalogo,
} from "@/lib/api";
import { clasesBordeNota, clasesMarco } from "@/lib/tienda-catalogo";
import { marcoCuadroPorId } from "@/lib/mural-marco-cuadro";
import { IconoCatalogo } from "@/lib/iconos-catalogo";
import { esFondoAnimado, fondoMuralCss, FONDOS_LLUVIA_IDS } from "@/lib/mural-fondos";
import { coloresNombreMural } from "@/lib/mural-colores-nombre";
import { ESTILO_RAREZA, ordenarPorRareza } from "@/lib/rareza-tienda";

type Categoria =
  | "marco"
  | "titulo"
  | "fondo"
  | "mascota"
  | "colorNombre"
  | "bordeNota"
  | "estampa"
  | "marcoCuadro";
type ItemCualquiera =
  | ItemMarcoTienda
  | ItemTituloTienda
  | ItemFondoTienda
  | ItemMascotaTienda
  | ItemColorNombreTienda
  | ItemBordeNotaTienda
  | ItemEstampaTienda
  | ItemMarcoCuadroTienda;

/** Categorías cuyo campo del perfil nunca puede quedar vacío — equipado no se puede "quitar", solo cambiar por otro. */
const CATEGORIAS_SIEMPRE_PUESTAS: Categoria[] = ["fondo", "colorNombre"];

/** Sin equipado: se compran una vez y quedan disponibles para usar donde corresponda, sin un solo "puesto" en el perfil. */
const CATEGORIAS_SIN_EQUIPAR: Categoria[] = ["bordeNota", "estampa"];

const MENSAJE_SIN_EQUIPAR: Record<string, string> = {
  bordeNota: "Ya lo tienes — actívalo desde el ícono de borde en cualquier nota.",
  estampa: "Ya la tienes — ábrela desde \"Mis Estampas\" en el Dock para colocarla en tu mural.",
};

const CATEGORIAS: { valor: Categoria; etiqueta: string; icono: React.ReactNode }[] = [
  { valor: "marco", etiqueta: "Marcos", icono: <Circle className="h-3.5 w-3.5" /> },
  { valor: "titulo", etiqueta: "Títulos", icono: <Type className="h-3.5 w-3.5" /> },
  { valor: "fondo", etiqueta: "Fondos", icono: <Sparkles className="h-3.5 w-3.5" /> },
  { valor: "mascota", etiqueta: "Mascotas", icono: <PawPrint className="h-3.5 w-3.5" /> },
  { valor: "colorNombre", etiqueta: "Colores de nombre", icono: <Palette className="h-3.5 w-3.5" /> },
  { valor: "bordeNota", etiqueta: "Bordes de nota", icono: <StickyNote className="h-3.5 w-3.5" /> },
  { valor: "estampa", etiqueta: "Estampas", icono: <Sticker className="h-3.5 w-3.5" /> },
  { valor: "marcoCuadro", etiqueta: "Marcos de cuadro", icono: <Frame className="h-3.5 w-3.5" /> },
];

const RAREZAS_EN_ORDEN: RarezaItemTienda[] = ["legendario", "epico", "raro", "comun"];

function nombreDe(item: ItemCualquiera): string {
  return "nombre" in item ? item.nombre : (item as ItemTituloTienda).texto;
}

/** Los bordes de nota no tienen `equipado` (se eligen por nota, no en el perfil) — este helper evita repetir el chequeo de tipo. */
function equipadoDe(item: ItemCualquiera): boolean {
  return "equipado" in item && item.equipado;
}

function VistaPrevia({ categoria, item, grande }: { categoria: Categoria; item: ItemCualquiera; grande?: boolean }) {
  const alto = grande ? "h-24" : "h-16";
  if (categoria === "marco") {
    return (
      <div className={`flex ${alto} items-center justify-center`}>
        <span
          className={`flex items-center justify-center rounded-full bg-gradient-to-br from-white/15 to-white/5 ${grande ? "h-16 w-16" : "h-11 w-11"} ${clasesMarco(item.id)}`}
        >
          <span className={`rounded-full bg-white/20 ${grande ? "h-9 w-9" : "h-6 w-6"}`} />
        </span>
      </div>
    );
  }
  if (categoria === "titulo") {
    const t = item as ItemTituloTienda;
    return (
      <div className={`flex ${alto} items-center justify-center px-2`}>
        <span
          className={`flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 text-center font-semibold text-white ${grande ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs"}`}
        >
          <IconoCatalogo id={t.icono} className={grande ? "h-4 w-4 shrink-0" : "h-3.5 w-3.5 shrink-0"} />
          {t.texto}
        </span>
      </div>
    );
  }
  if (categoria === "mascota") {
    const m = item as ItemMascotaTienda;
    return (
      <div className={`flex ${alto} items-center justify-center`}>
        <span
          className={`flex items-center justify-center overflow-hidden rounded-full bg-white/5 ${grande ? "h-20 w-20" : "h-12 w-12"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/mascotas/${m.id}.png`} alt="" className="h-full w-full object-contain" />
        </span>
      </div>
    );
  }
  if (categoria === "colorNombre") {
    const colores = coloresNombreMural(item.id);
    return (
      <div className={`flex ${alto} items-center justify-center`}>
        <span
          className={`font-display font-bold ${grande ? "text-3xl" : "text-lg"}`}
          style={{
            backgroundImage: `linear-gradient(90deg, ${colores.join(", ")})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Abc
        </span>
      </div>
    );
  }
  if (categoria === "bordeNota") {
    return (
      <div className={`flex ${alto} items-center justify-center`}>
        <div
          className={`rounded-[3px] bg-amber-200 ${grande ? "h-14 w-14" : "h-9 w-9"} ${clasesBordeNota(item.id)}`}
        />
      </div>
    );
  }
  if (categoria === "estampa") {
    const e = item as ItemEstampaTienda;
    return (
      <div className={`flex ${alto} items-center justify-center`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={e.imagenUrl}
          alt=""
          className={`object-contain drop-shadow-md ${grande ? "h-20 w-20" : "h-12 w-12"}`}
        />
      </div>
    );
  }
  if (categoria === "marcoCuadro") {
    const marco = marcoCuadroPorId(item.id);
    const dim = grande ? "h-14 w-14" : "h-9 w-9";
    return (
      <div className={`flex ${alto} items-center justify-center`}>
        <span
          className={`inline-flex rounded-lg ${marco?.clases ?? "bg-white shadow-xl"}`}
          style={{ padding: grande ? (marco?.grosor ?? "0.5rem") : "0.35rem" }}
        >
          <span className={`rounded bg-white/25 ${dim}`} />
        </span>
      </div>
    );
  }
  const f = item as ItemFondoTienda;
  const esLluvia = (FONDOS_LLUVIA_IDS as readonly string[]).includes(f.id);
  const animado = esFondoAnimado(f.id);
  return (
    <div
      className={`relative ${alto} overflow-hidden rounded-lg ${animado ? "fondo-mural-animado" : ""}`}
      style={{ background: fondoMuralCss(f.id) }}
    >
      {esLluvia && (
        <span className="absolute right-1.5 bottom-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
          <CloudRain className="h-3 w-3 text-white/90" />
        </span>
      )}
    </div>
  );
}

/** Insignia de estado sobre la tarjeta chica — la acción real (comprar/equipar) vive en el modal de detalle. */
function InsigniaEstado({ categoria, item }: { categoria: Categoria; item: ItemCualquiera }) {
  if (!item.comprado) {
    return (
      <span className="flex w-full items-center justify-center gap-1 rounded-lg bg-white/5 py-1.5 text-xs font-bold text-amber-300">
        <Coins className="h-3.5 w-3.5" /> {item.precio}
      </span>
    );
  }
  if (CATEGORIAS_SIN_EQUIPAR.includes(categoria)) {
    return (
      <span className="flex w-full items-center justify-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 py-1.5 text-[11px] font-semibold text-emerald-300">
        Comprado
      </span>
    );
  }
  if (equipadoDe(item)) {
    return (
      <span className="flex w-full items-center justify-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 py-1.5 text-[11px] font-semibold text-emerald-300">
        Equipado
      </span>
    );
  }
  return (
    <span className="flex w-full items-center justify-center gap-1 rounded-lg border border-white/10 py-1.5 text-[11px] font-medium text-white/50">
      Ver
    </span>
  );
}

function TarjetaItem({
  categoria,
  item,
  onAbrir,
}: {
  categoria: Categoria;
  item: ItemCualquiera;
  onAbrir: () => void;
}) {
  const estilo = ESTILO_RAREZA[item.rareza];

  return (
    <button
      onClick={onAbrir}
      className={`flex flex-col gap-2 rounded-xl border bg-white/[0.03] p-2.5 text-left transition-colors hover:bg-white/[0.06] ${estilo.borde} ${
        equipadoDe(item) ? estilo.resplandor : ""
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
        <p className="truncate text-center text-xs font-semibold text-white">{nombreDe(item)}</p>
        <p className={`text-center text-[10px] font-medium tracking-wide uppercase ${estilo.texto}`}>{estilo.etiqueta}</p>
      </div>
      <InsigniaEstado categoria={categoria} item={item} />
    </button>
  );
}

/** Modal de detalle: se abre al tocar cualquier ítem — descripción, precio y el botón "Adquirir"/"Equipar" real. */
function DetalleItemModal({
  categoria,
  item,
  monedas,
  cargando,
  error,
  onClose,
  onComprar,
  onEquipar,
}: {
  categoria: Categoria;
  item: ItemCualquiera | null;
  monedas: number;
  cargando: boolean;
  error: string | null;
  onClose: () => void;
  onComprar: () => void;
  onEquipar: () => void;
}) {
  return (
    <AnimatePresence>
      {item && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1c1c26] to-[#0e0e14] shadow-2xl"
          >
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center gap-1 border-b border-white/10 px-5 pt-6 pb-4">
              <VistaPrevia categoria={categoria} item={item} grande />
              <p className="mt-1 text-base font-bold text-white">{nombreDe(item)}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${ESTILO_RAREZA[item.rareza].fondoInsignia}`}
              >
                {ESTILO_RAREZA[item.rareza].etiqueta}
              </span>
            </div>

            <div className="space-y-4 px-5 py-4">
              <p className="text-center text-sm text-white/70">{item.descripcion}</p>

              {!item.comprado && (
                <div className="space-y-2">
                  <button
                    onClick={onComprar}
                    disabled={cargando}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 py-2.5 text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Coins className="h-4 w-4" /> {cargando ? "Adquiriendo..." : `Adquirir por ${item.precio}`}
                  </button>
                  {monedas < item.precio && (
                    <p className="flex items-center justify-center gap-1.5 text-center text-xs font-medium text-rose-400">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      No dispones de monedas suficientes para este ítem.
                    </p>
                  )}
                </div>
              )}

              {item.comprado && CATEGORIAS_SIN_EQUIPAR.includes(categoria) && (
                <p className="text-center text-xs font-medium text-emerald-300">{MENSAJE_SIN_EQUIPAR[categoria]}</p>
              )}
              {item.comprado && !CATEGORIAS_SIN_EQUIPAR.includes(categoria) && equipadoDe(item) && CATEGORIAS_SIEMPRE_PUESTAS.includes(categoria) && (
                <span className="flex w-full items-center justify-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 py-2.5 text-sm font-semibold text-emerald-300">
                  Equipado
                </span>
              )}
              {item.comprado &&
                !CATEGORIAS_SIN_EQUIPAR.includes(categoria) &&
                !(equipadoDe(item) && CATEGORIAS_SIEMPRE_PUESTAS.includes(categoria)) && (
                  <button
                    onClick={onEquipar}
                    disabled={cargando}
                    className={
                      equipadoDe(item)
                        ? "w-full rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                        : "w-full rounded-lg bg-emerald-500/90 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    }
                  >
                    {cargando ? "..." : equipadoDe(item) ? "Quitar" : "Equipar"}
                  </button>
                )}

              {error && <p className="text-center text-xs font-medium text-rose-400">{error}</p>}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function TiendaModal({
  open,
  onClose,
  onCambio,
}: {
  open: boolean;
  onClose: () => void;
  onCambio: (
    marcoId: string | null,
    tituloId: string | null,
    fondoId: string | null,
    mascotaId: string | null,
    colorNombreId: string,
    cuadroMarcoId: string | null,
  ) => void;
}) {
  const [catalogo, setCatalogo] = useState<CatalogoTienda | null>(null);
  const [categoria, setCategoria] = useState<Categoria>("marco");
  const [procesando, setProcesando] = useState<string | null>(null);
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRareza, setFiltroRareza] = useState<RarezaItemTienda | "">("");

  useEffect(() => {
    if (!open) return;
    fetchTiendaCatalogo()
      .then(setCatalogo)
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDetalleId(null);
      setErrorAccion(null);
      setBusqueda("");
      setFiltroRareza("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onEscape(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (detalleId) setDetalleId(null);
      else onClose();
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open, onClose, detalleId]);

  function aplicar(nuevo: CatalogoTienda) {
    setCatalogo(nuevo);
    onCambio(
      nuevo.marcos.find((m) => m.equipado)?.id ?? null,
      nuevo.titulos.find((t) => t.equipado)?.id ?? null,
      nuevo.fondos.find((f) => f.equipado)?.id ?? null,
      nuevo.mascotaEquipadaId,
      nuevo.colorNombreEquipadoId,
      nuevo.marcosCuadro.find((m) => m.equipado)?.id ?? null,
    );
  }

  function abrirDetalle(itemId: string) {
    setErrorAccion(null);
    setDetalleId(itemId);
  }

  function cambiarCategoria(nueva: Categoria) {
    setCategoria(nueva);
    setBusqueda("");
    setFiltroRareza("");
  }

  async function comprar(item: ItemCualquiera) {
    if (procesando) return;
    setErrorAccion(null);
    if (catalogo && catalogo.monedas < item.precio) return; // el mensaje ya se ve inline, no hace falta pegarle a la API
    setProcesando(item.id);
    try {
      aplicar(await comprarItemTienda(item.id));
    } catch {
      setErrorAccion("No se pudo completar la compra. Intenta de nuevo.");
    } finally {
      setProcesando(null);
    }
  }

  async function equipar(tipo: TipoItemTienda, itemId: string, yaEquipado: boolean) {
    if (procesando) return;
    setErrorAccion(null);
    setProcesando(itemId);
    try {
      aplicar(await equiparItemTienda(tipo, yaEquipado ? null : itemId));
    } catch {
      setErrorAccion("No se pudo actualizar. Intenta de nuevo.");
    } finally {
      setProcesando(null);
    }
  }

  const itemsCategoria: ItemCualquiera[] = useMemo(() => {
    if (!catalogo) return [];
    if (categoria === "marco") return catalogo.marcos;
    if (categoria === "titulo") return catalogo.titulos;
    if (categoria === "mascota") return catalogo.mascotas;
    if (categoria === "colorNombre") return catalogo.coloresNombre;
    if (categoria === "bordeNota") return catalogo.bordesNota;
    if (categoria === "estampa") return catalogo.estampas;
    if (categoria === "marcoCuadro") return catalogo.marcosCuadro;
    return catalogo.fondos;
  }, [catalogo, categoria]);

  const itemDetalle = itemsCategoria.find((i) => i.id === detalleId) ?? null;

  const itemsFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return itemsCategoria.filter((item) => {
      if (filtroRareza && item.rareza !== filtroRareza) return false;
      if (termino && !nombreDe(item).toLowerCase().includes(termino)) return false;
      return true;
    });
  }, [itemsCategoria, busqueda, filtroRareza]);

  const gruposPorRareza = useMemo(() => {
    const ordenados = ordenarPorRareza(itemsFiltrados);
    return RAREZAS_EN_ORDEN.map((r) => ({ rareza: r, items: ordenados.filter((i) => i.rareza === r) })).filter(
      (g) => g.items.length > 0,
    );
  }, [itemsFiltrados]);

  const rarezasDisponibles = useMemo(
    () => RAREZAS_EN_ORDEN.filter((r) => itemsCategoria.some((i) => i.rareza === r)),
    [itemsCategoria],
  );

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
                  <Coins className="h-4 w-4" /> {catalogo?.monedas ?? "…"}
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
            <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 px-5 py-2.5">
              {CATEGORIAS.map((c) => {
                const cantidad =
                  catalogo &&
                  (c.valor === "marco"
                    ? catalogo.marcos.length
                    : c.valor === "titulo"
                      ? catalogo.titulos.length
                      : c.valor === "mascota"
                        ? catalogo.mascotas.length
                        : c.valor === "colorNombre"
                          ? catalogo.coloresNombre.length
                          : c.valor === "bordeNota"
                            ? catalogo.bordesNota.length
                            : c.valor === "estampa"
                              ? catalogo.estampas.length
                              : c.valor === "marcoCuadro"
                                ? catalogo.marcosCuadro.length
                                : catalogo.fondos.length);
                return (
                  <button
                    key={c.valor}
                    onClick={() => cambiarCategoria(c.valor)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
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
            <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {catalogo !== null && itemsCategoria.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[160px] flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                    <input
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Buscar por nombre..."
                      className="w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pr-3 pl-8 text-xs text-white placeholder:text-white/40 focus:border-primary/50 focus:outline-none"
                    />
                  </div>
                  {rarezasDisponibles.length > 1 && (
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => setFiltroRareza("")}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase transition-colors ${
                          filtroRareza === ""
                            ? "bg-white/15 text-white"
                            : "text-white/40 hover:bg-white/5 hover:text-white/70"
                        }`}
                      >
                        Todas
                      </button>
                      {rarezasDisponibles.map((r) => (
                        <button
                          key={r}
                          onClick={() => setFiltroRareza(filtroRareza === r ? "" : r)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase transition-colors ${
                            filtroRareza === r
                              ? ESTILO_RAREZA[r].fondoInsignia
                              : "text-white/40 hover:bg-white/5 hover:text-white/70"
                          }`}
                        >
                          {ESTILO_RAREZA[r].etiqueta}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {catalogo === null ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-36 animate-pulse rounded-xl bg-white/5" />
                  ))}
                </div>
              ) : gruposPorRareza.length === 0 ? (
                <p className="py-10 text-center text-xs text-white/40">Ningún resultado con esos filtros.</p>
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
                            <TarjetaItem key={item.id} categoria={categoria} item={item} onAbrir={() => abrirDetalle(item.id)} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <DetalleItemModal
                categoria={categoria}
                item={itemDetalle}
                monedas={catalogo?.monedas ?? 0}
                cargando={procesando === itemDetalle?.id}
                error={errorAccion}
                onClose={() => setDetalleId(null)}
                onComprar={() => itemDetalle && void comprar(itemDetalle)}
                onEquipar={() => itemDetalle && void equipar(categoria, itemDetalle.id, equipadoDe(itemDetalle))}
              />
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
