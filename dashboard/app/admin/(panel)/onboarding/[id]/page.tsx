"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, FileDown, FileText, Trash2 } from "lucide-react";
import {
  type EstadoSolicitudImplementacion,
  type SolicitudImplementacionDetalle,
  AdminNoAutorizadoError,
  actualizarEstadoSolicitudImplementacionAdmin,
  borrarSolicitudImplementacionAdmin,
  fetchSolicitudImplementacionAdmin,
} from "@/lib/admin-api";
import { leerTokenAdmin, borrarTokenAdmin } from "@/lib/admin-auth";
import { LoadingScreen } from "@/components/LoadingScreen";

const ESTADOS: EstadoSolicitudImplementacion[] = ["NUEVA", "EN_PROCESO", "COMPLETADA"];
const ESTADO_LABEL: Record<EstadoSolicitudImplementacion, string> = {
  NUEVA: "Nueva",
  EN_PROCESO: "En proceso",
  COMPLETADA: "Completada",
};

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Campo({ label, valor }: { label: string; valor: React.ReactNode }) {
  if (valor === null || valor === undefined || valor === "") return null;
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-0.5 text-sm whitespace-pre-wrap text-foreground">{valor}</p>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h3 className="font-display mb-3 text-sm font-semibold text-foreground">{titulo}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export default function AdminOnboardingDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [s, setS] = useState<SolicitudImplementacionDetalle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  const [borrando, setBorrando] = useState(false);

  useEffect(() => {
    const token = leerTokenAdmin();
    if (!token) {
      router.replace("/admin");
      return;
    }
    fetchSolicitudImplementacionAdmin(token, id)
      .then(setS)
      .catch((err) => {
        if (err instanceof AdminNoAutorizadoError) {
          borrarTokenAdmin();
          router.replace("/admin");
        } else {
          setError("No se pudo cargar la solicitud.");
        }
      });
  }, [id, router]);

  async function cambiarEstado(nuevo: EstadoSolicitudImplementacion) {
    const token = leerTokenAdmin();
    if (!token || !s) return;
    setGuardandoEstado(true);
    try {
      const actualizada = await actualizarEstadoSolicitudImplementacionAdmin(token, id, nuevo);
      setS(actualizada);
    } finally {
      setGuardandoEstado(false);
    }
  }

  async function handleBorrar() {
    const token = leerTokenAdmin();
    if (!token || !s) return;
    if (!confirm(`¿Eliminar la solicitud de "${s.empresaNombre}"? Esta acción no se puede deshacer.`)) return;
    setBorrando(true);
    try {
      await borrarSolicitudImplementacionAdmin(token, id);
      router.push("/admin/onboarding");
    } catch (err) {
      if (err instanceof AdminNoAutorizadoError) {
        borrarTokenAdmin();
        router.replace("/admin");
      } else {
        alert("No se pudo eliminar la solicitud.");
      }
    } finally {
      setBorrando(false);
    }
  }

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!s) return <LoadingScreen />;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="print:hidden flex flex-wrap items-center gap-3">
        <Link href="/admin/onboarding" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Volver
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Estado:</span>
          <select
            value={s.estado}
            disabled={guardandoEstado}
            onChange={(e) => void cambiarEstado(e.target.value as EstadoSolicitudImplementacion)}
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {ESTADO_LABEL[e]}
              </option>
            ))}
          </select>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <FileText className="h-4 w-4" />
            Descargar reporte
          </button>
          <button
            onClick={() => void handleBorrar()}
            disabled={borrando}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-destructive transition-colors hover:border-destructive disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      </div>

      <div className="hidden print:block">
        <h1 className="font-display text-xl font-semibold text-foreground">TalentiX RD — Solicitud de implementación</h1>
        <p className="text-sm text-muted-foreground">
          {s.empresaNombre} · Recibida el {formatearFecha(s.createdAt)}
        </p>
        <div className="my-3 border-t border-border" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-start gap-4">
          {s.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.logoUrl} alt="Logo" className="h-14 w-14 shrink-0 rounded-md border border-border object-contain" />
          )}
          <div className="min-w-0">
            <h1 className="font-display text-lg font-semibold text-foreground">{s.empresaNombre}</h1>
            <p className="text-xs text-muted-foreground">Recibida el {formatearFecha(s.createdAt)}</p>
          </div>
        </div>
      </div>

      <Seccion titulo="1 · Sobre la empresa">
        <Campo label="A qué se dedican" valor={s.giroNegocio} />
        <Campo label="Cantidad de empleados" valor={s.cantidadEmpleados} />
      </Seccion>

      <Seccion titulo="2 · Estructura organizacional">
        <Campo label="Departamentos" valor={s.departamentos.length > 0 ? s.departamentos.join(", ") : null} />
        <Campo label="Roles/departamentos múltiples" valor={s.rolesMultiples} />
        <Campo label="CEO / dueño de la cuenta" valor={s.ceoNombre} />
        <Campo label="RRHH" valor={s.rrhhNombre} />
        {s.encargadosPorDepartamento && s.encargadosPorDepartamento.length > 0 && (
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Encargados por departamento</p>
            <ul className="mt-1 space-y-0.5">
              {s.encargadosPorDepartamento.map((en, i) => (
                <li key={i} className="text-sm text-foreground">
                  {en.nombre} <span className="text-muted-foreground">— {en.departamento}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Seccion>

      <Seccion titulo="3 · Equipo (roster)">
        {s.rosterArchivoUrl ? (
          <a
            href={s.rosterArchivoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <FileDown className="h-4 w-4" /> Descargar archivo del roster
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">No adjuntaron archivo — pedir en la llamada de arranque.</p>
        )}
      </Seccion>

      <Seccion titulo="4 · Vacantes con IA">
        <Campo label="¿Quiere el módulo?" valor={s.quiereVacantesIA ? "Sí" : "No"} />
      </Seccion>

      <Seccion titulo="5 · Bitácoras / agente TIX">
        <Campo label="Canal" valor={s.canalBitacoras === "grupo" ? "Grupo de WhatsApp" : "Privado"} />
        <Campo label="Nombre del grupo" valor={s.nombreGrupo} />
        <Campo label="Hora de check-in" valor={s.horaCheckin} />
        <Campo label="Hora de check-out" valor={s.horaCheckout} />
        <Campo label="Días laborales" valor={s.diasLaborales.length > 0 ? s.diasLaborales.join(", ") : null} />
        <Campo label="Recibe alertas y reporte semanal" valor={s.receptorAlertas} />
      </Seccion>

      <Seccion titulo="6 · Cómo miden el desempeño">
        <Campo label='"Un buen día de trabajo"' valor={s.buenDiaTrabajo} />
        <Campo label="Medición por rol/departamento" valor={s.medicionPorRol} />
        <Campo label="Qué califica bajo" valor={s.queCalificaBajo} />
        <Campo label="Interés en medir cumplimiento" valor={s.interesaCumplimiento} />
        <Campo label='Base del "talento del mes/semana"' valor={s.baseTalentoDelMes} />
      </Seccion>

      <Seccion titulo="7 · Contacto">
        <Campo label="Nombre" valor={s.contactoNombre} />
        <Campo label="Cargo" valor={s.contactoCargo} />
        <Campo label="Correo" valor={s.contactoCorreo} />
        <Campo label="Teléfono" valor={s.contactoTelefono} />
      </Seccion>
    </div>
  );
}
