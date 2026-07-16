"use client";

import { useEffect, useState } from "react";
import { type PeriodoRanking, type RankingsResponse, fetchRankings } from "@/lib/api";
import { usePanel } from "../PanelContext";
import { RankingTalentos } from "@/components/RankingTalentos";
import { SkeletonChart } from "@/components/motion/Skeleton";

const ETIQUETA_PERIODO: Record<PeriodoRanking, string> = {
  mensual: "Este mes",
  anual: "Este año",
  historico: "Histórico",
};

type Vista = "empresa" | "departamento";

function BotonPill({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors ${
        activo ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; datos: RankingsResponse };

function RankingsResultado({ slug, periodo }: { slug: string; periodo: PeriodoRanking }) {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [vista, setVista] = useState<Vista>("empresa");

  useEffect(() => {
    let cancelado = false;
    fetchRankings(slug, periodo)
      .then((datos) => {
        if (!cancelado) setEstado({ tipo: "listo", datos });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: "error" });
      });
    return () => {
      cancelado = true;
    };
  }, [slug, periodo]);

  if (estado.tipo === "cargando") return <SkeletonChart />;
  if (estado.tipo === "error") return <p className="text-sm text-destructive">No se pudo cargar el ranking.</p>;

  const { datos } = estado;
  const hayDepartamentos = datos.porDepartamento.length > 0;

  return (
    <div className="space-y-4">
      {hayDepartamentos && (
        <div className="flex gap-2">
          <BotonPill activo={vista === "empresa"} onClick={() => setVista("empresa")}>
            Toda la empresa
          </BotonPill>
          <BotonPill activo={vista === "departamento"} onClick={() => setVista("departamento")}>
            Por departamento
          </BotonPill>
        </div>
      )}

      {vista === "empresa" || !hayDepartamentos ? (
        <div className="min-h-[26rem]">
          <RankingTalentos talentos={datos.general} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {datos.porDepartamento.map((grupo) => (
            <div key={grupo.departamento} className="min-h-[24rem]">
              <RankingTalentos
                talentos={grupo.talentos}
                titulo={grupo.departamento}
                subtitulo="Ranking del departamento"
              />
            </div>
          ))}
          {datos.sinDepartamento && (
            <div className="min-h-[24rem]">
              <RankingTalentos
                talentos={datos.sinDepartamento}
                titulo="Sin departamento asignado"
                subtitulo="Ranking"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RankingsView() {
  const { slug } = usePanel();
  const [periodo, setPeriodo] = useState<PeriodoRanking>("mensual");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-card">
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground">Rankings</h1>
          <p className="text-sm text-muted-foreground">Comparativa de desempeño por puntaje IA</p>
        </div>
        <div className="flex gap-2">
          {(Object.keys(ETIQUETA_PERIODO) as PeriodoRanking[]).map((p) => (
            <BotonPill key={p} activo={periodo === p} onClick={() => setPeriodo(p)}>
              {ETIQUETA_PERIODO[p]}
            </BotonPill>
          ))}
        </div>
      </div>

      <RankingsResultado key={periodo} slug={slug} periodo={periodo} />
    </div>
  );
}
