"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Cake, CheckCircle2, ClipboardList, LogOut, Moon, PenSquare, Sparkles, Sun } from "lucide-react";
import {
  EmpresaNoEncontradaError,
  SesionInvalidaError,
  me,
  fetchBitacoras,
  registrarWorklogPropio,
  type BitacoraItem,
  type MeResponse,
} from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { BrandMark } from "@/components/BrandMark";
import { CampanaNotificaciones } from "@/components/notificaciones/CampanaNotificaciones";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ErrorScreen } from "@/components/ErrorScreen";
import { MetricCard } from "@/components/MetricCard";
import { CheckinBadge } from "@/components/CheckinBadge";
import { EstadoBadge } from "@/components/EstadoBadge";
import { ChatFlotante } from "@/components/chat/ChatFlotante";

type Estado = { tipo: "cargando" } | { tipo: "error"; mensaje: string } | { tipo: "listo"; sesion: MeResponse };

// Coincide con la fecha "hoy" que ya usa el backend para esta bitácora
// (WorklogsService.hoyISO) — fija en horario de RD, no en el del navegador,
// para que ambos lados nunca se desincronicen (ej. un CEO revisando su
// bitácora desde otro huso horario, o el reloj del sistema mal configurado).
function hoyISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santo_Domingo" }).format(new Date());
}

function primerDiaMes(): string {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
}

function formatearFechaLarga(): string {
  const texto = new Date().toLocaleDateString("es-DO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "America/Santo_Domingo",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [montado, setMontado] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMontado(true), []);
  const esOscuro = montado && resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(esOscuro ? "light" : "dark")}
      aria-label={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
    >
      {esOscuro ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function BitacoraHoyCard({ slug, onRegistrada }: { slug: string; onRegistrada: () => void }) {
  const [hoy, setHoy] = useState<BitacoraItem | null | "cargando">("cargando");
  const [tareasPlanificadas, setTareasPlanificadas] = useState("");
  const [actividadesRealizadas, setActividadesRealizadas] = useState("");
  const [informeAvances, setInformeAvances] = useState("");
  const [objetivoDia, setObjetivoDia] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function recargar() {
    const fecha = hoyISO();
    fetchBitacoras(slug, { fechaInicio: fecha, fechaFin: fecha, limit: 1 })
      .then((resp) => setHoy(resp.data[0] ?? null))
      .catch(() => setHoy(null));
  }

  useEffect(recargar, [slug]);

  async function handleCheckin() {
    if (!tareasPlanificadas.trim()) {
      setError("Cuéntanos qué planificas hacer hoy.");
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      await registrarWorklogPropio({ tipo: "checkin", tareasPlanificadas });
      setTareasPlanificadas("");
      recargar();
      onRegistrada();
    } catch {
      setError("No se pudo registrar el check-in. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleCheckout() {
    if (!actividadesRealizadas.trim()) {
      setError("Cuéntanos qué hiciste hoy.");
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      await registrarWorklogPropio({
        tipo: "checkout",
        actividadesRealizadas,
        informeAvances: informeAvances || undefined,
        objetivoDia: objetivoDia || undefined,
      });
      setActividadesRealizadas("");
      setInformeAvances("");
      setObjetivoDia("");
      recargar();
      onRegistrada();
    } catch {
      setError("No se pudo registrar el check-out. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const campoClases =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

  if (hoy === "cargando") {
    return <div className="h-48 animate-pulse rounded-xl border border-border bg-card" />;
  }

  const yaHizoCheckin = hoy?.checkinEnviado ?? false;
  const yaHizoCheckout = hoy != null && hoy.estadoEnvio.includes("✅");

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Bitácora de hoy</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{formatearFechaLarga()}</p>
        </div>
        <div className="flex items-center gap-2">
          <CheckinBadge checkinEnviado={yaHizoCheckin} horaCheckin={hoy?.horaCheckin ?? null} />
          <EstadoBadge estado={hoy?.estadoEnvio ?? "❌ No enviada"} />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      {!yaHizoCheckin && (
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium text-foreground">¿Qué planificas hacer hoy?</label>
          <textarea
            value={tareasPlanificadas}
            onChange={(e) => setTareasPlanificadas(e.target.value)}
            rows={3}
            placeholder="Ej. Terminar el reporte semanal, reunión con el cliente..."
            className={campoClases}
          />
          <button
            onClick={handleCheckin}
            disabled={enviando}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
          >
            {enviando ? "Enviando..." : "Registrar check-in"}
          </button>
        </div>
      )}

      {yaHizoCheckin && !yaHizoCheckout && (
        <div className="mt-4 space-y-3">
          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Tu plan de hoy: </span>
            {hoy?.tareasPlanificadas}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">¿Qué hiciste hoy?</label>
            <textarea
              value={actividadesRealizadas}
              onChange={(e) => setActividadesRealizadas(e.target.value)}
              rows={3}
              placeholder="Resume tus actividades del día..."
              className={campoClases}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Avances y logros (opcional)</label>
            <textarea
              value={informeAvances}
              onChange={(e) => setInformeAvances(e.target.value)}
              rows={2}
              className={campoClases}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">¿Cumpliste el objetivo del día? (opcional)</label>
            <input
              value={objetivoDia}
              onChange={(e) => setObjetivoDia(e.target.value)}
              placeholder="Ej. Sí, entregué el reporte a tiempo"
              className={campoClases}
            />
          </div>
          <button
            onClick={handleCheckout}
            disabled={enviando}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
          >
            {enviando ? "Enviando..." : "Registrar check-out"}
          </button>
        </div>
      )}

      {yaHizoCheckin && yaHizoCheckout && (
        <p className="mt-4 text-sm text-success">✅ Ya completaste tu bitácora de hoy. ¡Buen trabajo!</p>
      )}
    </div>
  );
}

function MiProgreso({ slug, recargarClave }: { slug: string; recargarClave: number }) {
  const [items, setItems] = useState<BitacoraItem[] | null>(null);
  const [resumen, setResumen] = useState<{ totalBitacoras: number; porcentajeEnviadas: number; puntajeProm: number | null } | null>(
    null,
  );

  useEffect(() => {
    fetchBitacoras(slug, { fechaInicio: primerDiaMes(), fechaFin: hoyISO(), limit: 10 })
      .then((resp) => {
        setItems(resp.data);
        setResumen(resp.resumen);
      })
      .catch(() => {
        setItems([]);
        setResumen(null);
      });
  }, [slug, recargarClave]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Bitácoras este mes"
          value={resumen ? String(resumen.totalBitacoras) : "—"}
          icon={ClipboardList}
        />
        <MetricCard
          label="% de cumplimiento"
          value={resumen ? `${resumen.porcentajeEnviadas}%` : "—"}
          icon={CheckCircle2}
        />
        <MetricCard
          label="Puntaje IA promedio"
          value={resumen?.puntajeProm == null ? "—" : `${resumen.puntajeProm.toFixed(1)} / 10`}
          icon={Sparkles}
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card">
        <p className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">Historial reciente</p>
        {items === null && <div className="h-32 animate-pulse" />}
        {items !== null && items.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Todavía no tienes bitácoras este mes.</p>
        )}
        {items !== null && items.length > 0 && (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span className="tabular-nums text-muted-foreground">
                  {new Date(item.fecha).toLocaleDateString("es-DO", { day: "2-digit", month: "short", timeZone: "UTC" })}
                </span>
                <div className="flex items-center gap-2">
                  <CheckinBadge checkinEnviado={item.checkinEnviado} horaCheckin={item.horaCheckin} />
                  <EstadoBadge estado={item.estadoEnvio} />
                  {item.puntajeIA !== null && (
                    <span className="text-xs font-semibold text-foreground">{item.puntajeIA}/10</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function MiEspacioPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [recargarClave, setRecargarClave] = useState(0);

  useEffect(() => {
    let cancelado = false;
    me()
      .then((sesion) => {
        if (cancelado) return;
        if (!sesion.empresa || sesion.empresa.slug !== slug) {
          router.replace("/");
          return;
        }
        if (!sesion.usuario.passwordEstablecida) {
          router.replace("/activar-cuenta");
          return;
        }
        // Solo el TALENTO vive aquí; el resto de roles usan el panel completo.
        if (sesion.usuario.rol !== "TALENTO") {
          router.replace(`/${slug}/dashboard`);
          return;
        }
        setEstado({ tipo: "listo", sesion });
      })
      .catch((err) => {
        if (cancelado) return;
        if (err instanceof SesionInvalidaError) {
          router.replace("/");
        } else if (err instanceof EmpresaNoEncontradaError) {
          setEstado({ tipo: "error", mensaje: err.message });
        } else {
          setEstado({ tipo: "error", mensaje: "No se pudo conectar con el servidor." });
        }
      });
    return () => {
      cancelado = true;
    };
  }, [slug, router]);

  if (estado.tipo === "cargando") return <LoadingScreen />;
  if (estado.tipo === "error") return <ErrorScreen message={estado.mensaje} />;

  async function handleLogout() {
    await getSupabaseBrowserClient().auth.signOut();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-8">
        <BrandMark />
        <div className="flex items-center gap-2">
          <Link
            href={`/${slug}/mi-mural`}
            className="flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <PenSquare className="h-4 w-4" />
            Mi Mural
          </Link>
          <Link
            href={`/${slug}/cumpleanos`}
            className="flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Cake className="h-4 w-4" />
            Cumpleaños
          </Link>
          <CampanaNotificaciones slug={slug} />
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Hola, {estado.sesion.usuario.nombre.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tu espacio para registrar tu bitácora y ver tu progreso.</p>
        </div>

        <BitacoraHoyCard slug={slug} onRegistrada={() => setRecargarClave((c) => c + 1)} />
        <MiProgreso slug={slug} recargarClave={recargarClave} />
      </main>
      <ChatFlotante slug={slug} />
    </div>
  );
}
