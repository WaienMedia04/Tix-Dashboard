"use client";

import { useEffect, useState } from "react";
import { Briefcase, Pencil, Plus, Sparkles, Trash2, Users, X } from "lucide-react";
import {
  type CandidatoInterno,
  type DepartamentoDefinicion,
  type EstadoVacante,
  type VacanteItem,
  actualizarVacante,
  borrarVacante,
  buscarCandidatosInternos,
  crearVacante,
  fetchDepartamentos,
  fetchVacantes,
} from "@/lib/api";
import { usePanel } from "../PanelContext";
import { CampoDepartamento } from "@/components/CampoDepartamento";
import { EnlaceTalento } from "@/components/EnlaceTalento";
import { Avatar } from "@/components/Avatar";
import { Modal } from "@/components/Modal";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { SkeletonTableRows } from "@/components/motion/Skeleton";

const CAMPO_CLASES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

const ESTADOS: { valor: EstadoVacante; label: string; texto: string; fondo: string }[] = [
  { valor: "ABIERTA", label: "Abierta", texto: "text-success", fondo: "bg-success/10" },
  { valor: "CERRADA", label: "Cerrada", texto: "text-muted-foreground", fondo: "bg-muted" },
];

function metaEstado(estado: EstadoVacante) {
  return ESTADOS.find((e) => e.valor === estado) ?? ESTADOS[0];
}

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-DO", { day: "2-digit", month: "long", year: "numeric" });
}

interface FormValores {
  titulo: string;
  descripcion: string;
  departamento: string;
}

const VALORES_VACIOS: FormValores = { titulo: "", descripcion: "", departamento: "" };

function ResultadoCandidatos({ resultado, cargando }: { resultado: CandidatoInterno[] | null; cargando: boolean }) {
  if (cargando) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-16 rounded-lg" />
        ))}
      </div>
    );
  }
  if (resultado === null) {
    return <p className="text-sm text-destructive">No se pudo completar el análisis con IA. Intenta de nuevo.</p>;
  }
  if (resultado.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay talentos activos con un CV analizado para comparar contra esta vacante.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {resultado.map((c) => (
        <div key={c.talentoId} className="rounded-lg border border-border bg-card p-3.5 shadow-card">
          <div className="flex items-start gap-3">
            <Avatar nombreCompleto={c.nombreCompleto} fotoUrl={c.fotoUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">
                  <EnlaceTalento talentoId={c.talentoId}>{c.nombreCompleto}</EnlaceTalento>
                  {c.departamento && <span className="ml-1.5 text-xs font-normal text-muted-foreground">· {c.departamento}</span>}
                </p>
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary tabular-nums">
                  {c.puntaje}/100
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{c.justificacion}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TarjetaVacante({
  item,
  onEditar,
  onBorrar,
  onBuscarCandidatos,
}: {
  item: VacanteItem;
  onEditar: () => void;
  onBorrar: () => void;
  onBuscarCandidatos: () => void;
}) {
  const meta = metaEstado(item.estado);
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3.5 shadow-card">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Briefcase className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{item.titulo}</p>
            <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${meta.fondo} ${meta.texto}`}>{meta.label}</span>
            {item.departamento && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {item.departamento}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onBuscarCandidatos}
              aria-label="Buscar candidatos internos"
              title="Buscar candidatos internos con IA"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-primary"
            >
              <Users className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onEditar}
              aria-label="Editar"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onBorrar}
              aria-label="Borrar"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <p className="mt-1 line-clamp-3 text-sm whitespace-pre-wrap text-muted-foreground">{item.descripcion}</p>
        <p className="mt-1.5 text-[11px] text-muted-foreground/70">
          Publicada por {item.autorNombre} el {formatearFecha(item.createdAt)}
        </p>
      </div>
    </div>
  );
}

function FormularioVacante({
  slug,
  editando,
  departamentos,
  onGuardado,
  onCancelarEdicion,
}: {
  slug: string;
  editando: VacanteItem | null;
  departamentos: DepartamentoDefinicion[];
  onGuardado: (item: VacanteItem, esEdicion: boolean) => void;
  onCancelarEdicion: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [valores, setValores] = useState<FormValores>(VALORES_VACIOS);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editando) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- precarga intencional al hacer clic en "Editar"
      setValores({
        titulo: editando.titulo,
        descripcion: editando.descripcion,
        departamento: editando.departamento ?? "",
      });
      setAbierto(true);
    }
  }, [editando]);

  function cerrar() {
    setAbierto(false);
    setValores(VALORES_VACIOS);
    setError(null);
    if (editando) onCancelarEdicion();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valores.titulo.trim() || !valores.descripcion.trim()) return;
    setEnviando(true);
    setError(null);
    try {
      const datos = {
        titulo: valores.titulo.trim(),
        descripcion: valores.descripcion.trim(),
        departamento: valores.departamento.trim() || undefined,
      };
      const item = editando ? await actualizarVacante(slug, editando.id, datos) : await crearVacante(slug, datos);
      onGuardado(item, !!editando);
      cerrar();
    } catch {
      setError("No se pudo guardar la vacante.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card shadow-card">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {editando ? "Editando vacante" : "Publicar vacante"}
        </p>
        {!editando && (
          <button
            onClick={() => (abierto ? cerrar() : setAbierto(true))}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {abierto ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {abierto ? "Cerrar" : "Nueva"}
          </button>
        )}
      </div>

      {abierto && (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3 border-t border-border bg-muted/30 px-4 py-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Título del puesto</label>
              <input
                value={valores.titulo}
                onChange={(e) => setValores((v) => ({ ...v, titulo: e.target.value }))}
                maxLength={160}
                className={CAMPO_CLASES}
                required
              />
            </div>
            <CampoDepartamento
              label="Departamento"
              value={valores.departamento}
              onChange={(v) => setValores((f) => ({ ...f, departamento: v }))}
              departamentos={departamentos}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Descripción del puesto</label>
            <textarea
              value={valores.descripcion}
              onChange={(e) => setValores((v) => ({ ...v, descripcion: e.target.value }))}
              rows={6}
              maxLength={6000}
              className={CAMPO_CLASES}
              placeholder="Responsabilidades, requisitos, experiencia deseada..."
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={enviando}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? "Guardando..." : editando ? "Guardar cambios" : "Publicar"}
            </button>
            {editando && (
              <button type="button" onClick={cerrar} className="text-xs font-medium text-muted-foreground hover:text-foreground">
                Cancelar
              </button>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </form>
      )}
    </div>
  );
}

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; items: VacanteItem[] };

export function VacantesView() {
  const { slug } = usePanel();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [departamentos, setDepartamentos] = useState<DepartamentoDefinicion[]>([]);
  const [editando, setEditando] = useState<VacanteItem | null>(null);

  const [vacanteCandidatos, setVacanteCandidatos] = useState<VacanteItem | null>(null);
  const [buscandoCandidatos, setBuscandoCandidatos] = useState(false);
  const [candidatos, setCandidatos] = useState<CandidatoInterno[] | null>(null);

  useEffect(() => {
    let cancelado = false;
    fetchVacantes(slug)
      .then((items) => {
        if (!cancelado) setEstado({ tipo: "listo", items });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: "error" });
      });
    fetchDepartamentos(slug)
      .then((deptos) => {
        if (!cancelado) setDepartamentos(deptos);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [slug]);

  function handleGuardado(item: VacanteItem, esEdicion: boolean) {
    setEstado((prev) => {
      if (prev.tipo !== "listo") return prev;
      return {
        tipo: "listo",
        items: esEdicion ? prev.items.map((i) => (i.id === item.id ? item : i)) : [item, ...prev.items],
      };
    });
    setEditando(null);
  }

  async function handleBorrar(item: VacanteItem) {
    if (!confirm(`¿Borrar la vacante "${item.titulo}"?`)) return;
    setEstado((prev) => (prev.tipo === "listo" ? { tipo: "listo", items: prev.items.filter((i) => i.id !== item.id) } : prev));
    try {
      await borrarVacante(slug, item.id);
    } catch {
      // ya se quitó del estado local
    }
  }

  async function handleBuscarCandidatos(item: VacanteItem) {
    setVacanteCandidatos(item);
    setCandidatos(null);
    setBuscandoCandidatos(true);
    try {
      const r = await buscarCandidatosInternos(slug, item.id);
      setCandidatos(r.evaluados ? r.candidatos : null);
    } catch {
      setCandidatos(null);
    } finally {
      setBuscandoCandidatos(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-lg font-semibold text-foreground">Vacantes</h1>
        <p className="text-sm text-muted-foreground">
          Publica vacantes disponibles — los talentos las ven en el mural informativo — y busca candidatos internos con IA.
        </p>
      </div>

      <FormularioVacante
        slug={slug}
        editando={editando}
        departamentos={departamentos}
        onGuardado={handleGuardado}
        onCancelarEdicion={() => setEditando(null)}
      />

      {estado.tipo === "cargando" && (
        <div className="rounded-lg border border-border bg-card">
          <table className="w-full">
            <tbody>
              <SkeletonTableRows rows={5} cols={1} />
            </tbody>
          </table>
        </div>
      )}
      {estado.tipo === "error" && <p className="text-sm text-destructive">No se pudieron cargar las vacantes.</p>}
      {estado.tipo === "listo" && estado.items.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
          Todavía no hay vacantes publicadas.
        </div>
      )}
      {estado.tipo === "listo" && estado.items.length > 0 && (
        <StaggerGroup className="space-y-2">
          {estado.items.map((item) => (
            <StaggerItem key={item.id}>
              <TarjetaVacante
                item={item}
                onEditar={() => setEditando(item)}
                onBorrar={() => void handleBorrar(item)}
                onBuscarCandidatos={() => void handleBuscarCandidatos(item)}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      <Modal
        open={vacanteCandidatos !== null}
        onClose={() => setVacanteCandidatos(null)}
        title={
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Candidatos internos {vacanteCandidatos ? `· ${vacanteCandidatos.titulo}` : ""}
          </span>
        }
        description="Comparación con IA entre esta vacante y los CV ya analizados de los talentos activos de la empresa."
        size="lg"
      >
        <ResultadoCandidatos resultado={candidatos} cargando={buscandoCandidatos} />
      </Modal>
    </div>
  );
}
