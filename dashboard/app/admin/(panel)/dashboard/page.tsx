"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, ClipboardList, Users } from "lucide-react";
import { type DashboardAdmin, fetchAdminDashboard, cambiarEstadoEmpresa, AdminNoAutorizadoError } from "@/lib/admin-api";
import { leerTokenAdmin, borrarTokenAdmin } from "@/lib/admin-auth";
import { LoadingScreen } from "@/components/LoadingScreen";

function BadgePlan({ plan }: { plan: string }) {
  const colores: Record<string, string> = {
    starter: "bg-muted text-muted-foreground",
    pro: "bg-primary/10 text-primary",
    enterprise: "bg-accent-dark/10 text-accent-dark",
  };
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-semibold capitalize ${colores[plan] ?? "bg-muted text-muted-foreground"}`}>
      {plan}
    </span>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardAdmin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    const token = leerTokenAdmin();
    if (!token) { router.replace("/admin"); return; }
    fetchAdminDashboard(token)
      .then(setData)
      .catch((err) => {
        if (err instanceof AdminNoAutorizadoError) { borrarTokenAdmin(); router.replace("/admin"); }
        else setError("No se pudo cargar el dashboard.");
      });
  }, [router]);

  async function toggleEmpresa(id: string, activoActual: boolean) {
    const token = leerTokenAdmin();
    if (!token) return;
    setToggling(id);
    try {
      const result = await cambiarEstadoEmpresa(token, id, !activoActual);
      setData((prev) =>
        prev
          ? {
              ...prev,
              resumen: {
                ...prev.resumen,
                empresasActivas: result.activo ? prev.resumen.empresasActivas + 1 : prev.resumen.empresasActivas - 1,
                empresasInactivas: result.activo ? prev.resumen.empresasInactivas - 1 : prev.resumen.empresasInactivas + 1,
              },
              empresas: prev.empresas.map((e) => (e.id === id ? { ...e, activo: result.activo } : e)),
            }
          : prev,
      );
    } finally {
      setToggling(null);
    }
  }

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!data) return <LoadingScreen />;

  const { resumen, empresas } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Total empresas", value: resumen.totalEmpresas, icon: Building2 },
          { label: "Activas", value: resumen.empresasActivas, icon: Building2, color: "text-success" },
          { label: "Inactivas", value: resumen.empresasInactivas, icon: Building2, color: "text-muted-foreground" },
          { label: "Total empleados", value: resumen.totalEmpleados, icon: Users },
          { label: "Total bitácoras", value: resumen.totalBitacoras, icon: ClipboardList },
        ].map((m) => (
          <div key={m.label} className="select-none rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{m.label}</p>
            <p className={`font-display mt-2 text-2xl font-semibold tabular-nums ${m.color ?? "text-foreground"}`}>
              {m.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-base font-semibold text-foreground">Empresas registradas</h2>
          <Link
            href="/admin/empresas"
            className="text-xs font-medium text-primary hover:underline"
          >
            Gestionar →
          </Link>
        </div>
        {/* Escritorio/tablet ancha: tabla */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <th className="px-5 py-3">Empresa</th>
                <th className="px-3 py-3">Slug</th>
                <th className="px-3 py-3">Plan</th>
                <th className="px-3 py-3 text-right">Empleados</th>
                <th className="px-3 py-3 text-right">Bitácoras</th>
                <th className="px-3 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {empresas.map((e) => (
                <tr key={e.id} className="hover:bg-accent/40">
                  <td className="px-5 py-3">
                    <Link href={`/admin/empresas/${e.id}`} className="font-medium text-foreground hover:text-primary">
                      {e.nombre}
                    </Link>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{e.slug}</td>
                  <td className="px-3 py-3"><BadgePlan plan={e.plan} /></td>
                  <td className="px-3 py-3 text-right tabular-nums">{e.totalEmpleados}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{e.totalBitacoras}</td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => void toggleEmpresa(e.id, e.activo)}
                      disabled={toggling === e.id}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${e.activo ? "bg-success/10 text-success hover:bg-success/20" : "bg-destructive/10 text-destructive hover:bg-destructive/20"} disabled:opacity-50`}
                    >
                      {toggling === e.id ? "..." : e.activo ? "Activa" : "Inactiva"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Celular/tablet vertical: tarjetas apiladas */}
        <div className="divide-y divide-border lg:hidden">
          {empresas.map((e) => (
            <div key={e.id} className="flex flex-col gap-2 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/admin/empresas/${e.id}`}
                    className="truncate text-sm font-medium text-foreground hover:text-primary"
                  >
                    {e.nombre}
                  </Link>
                  <p className="truncate text-xs font-mono text-muted-foreground">{e.slug}</p>
                </div>
                <button
                  onClick={() => void toggleEmpresa(e.id, e.activo)}
                  disabled={toggling === e.id}
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${e.activo ? "bg-success/10 text-success hover:bg-success/20" : "bg-destructive/10 text-destructive hover:bg-destructive/20"} disabled:opacity-50`}
                >
                  {toggling === e.id ? "..." : e.activo ? "Activa" : "Inactiva"}
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <BadgePlan plan={e.plan} />
                <span className="tabular-nums">{e.totalEmpleados} empl.</span>
                <span className="tabular-nums">{e.totalBitacoras} bit.</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
