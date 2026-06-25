"use client";

import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { type EmpleadoResumen, crearTalento, fetchEmpleados } from "@/lib/api";

const CAMPO_CLASES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; empleados: EmpleadoResumen[] };

export function ListaEmpleados({ slug, codigoAcceso }: { slug: string; codigoAcceso: string }) {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [rol, setRol] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    fetchEmpleados(slug, codigoAcceso)
      .then((empleados) => {
        if (!cancelado) setEstado({ tipo: "listo", empleados });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: "error" });
      });
    return () => {
      cancelado = true;
    };
  }, [slug, codigoAcceso]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombreCompleto.trim() || !rol.trim()) return;
    setEnviando(true);
    setErrorForm(null);
    crearTalento(slug, codigoAcceso, { nombreCompleto: nombreCompleto.trim(), rol: rol.trim() })
      .then((nuevo) => {
        setEstado((prev) =>
          prev.tipo === "listo" ? { tipo: "listo", empleados: [...prev.empleados, nuevo] } : prev,
        );
        setNombreCompleto("");
        setRol("");
        setMostrarForm(false);
      })
      .catch(() => setErrorForm("No se pudo agregar el empleado."))
      .finally(() => setEnviando(false));
  }

  return (
    <div className="rounded-lg border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Users className="h-4 w-4" />
          </span>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Empleados registrados
          </p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar empleado
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Nombre completo
            </label>
            <input
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              className={CAMPO_CLASES}
              placeholder="Nombre y apellido"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Rol</label>
            <input
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className={CAMPO_CLASES}
              placeholder="Cargo o rol"
              required
            />
          </div>
          <button
            type="submit"
            disabled={enviando}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando ? "Guardando..." : "Guardar"}
          </button>
          {errorForm && <p className="text-xs text-destructive">{errorForm}</p>}
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {estado.tipo === "cargando" && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Cargando...
                </td>
              </tr>
            )}
            {estado.tipo === "error" && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-destructive">
                  No se pudo cargar el listado de empleados.
                </td>
              </tr>
            )}
            {estado.tipo === "listo" &&
              estado.empleados.map((e) => (
                <tr key={e.id} className="border-t border-border transition-colors hover:bg-muted/50">
                  <td className="px-4 py-2.5 font-medium text-foreground">{e.nombreCompleto}</td>
                  <td className="max-w-[260px] truncate px-4 py-2.5 text-muted-foreground" title={e.rol}>
                    {e.rol}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                        e.estado === "activo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {e.estado === "activo" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
