import type { DepartamentoDefinicion } from "@/lib/api";

const CAMPO_CLASES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

/**
 * Selector múltiple de departamentos (para el Gerente General, que puede
 * supervisar varios) — misma lógica que CampoDepartamento pero con
 * selección múltiple; cae a texto libre separado por comas si la empresa
 * no tiene un catálogo configurado.
 */
export function CampoDepartamentosMultiple({
  label,
  value,
  onChange,
  departamentos,
  className,
}: {
  label: string;
  value: string[];
  onChange: (valor: string[]) => void;
  departamentos: DepartamentoDefinicion[];
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</label>
      {departamentos.length > 0 ? (
        <>
          <select
            multiple
            value={value}
            onChange={(e) => onChange(Array.from(e.target.selectedOptions, (o) => o.value))}
            className={`${className ?? CAMPO_CLASES} min-h-[5.5rem]`}
          >
            {departamentos.map((d) => (
              <option key={d.id} value={d.nombre}>
                {d.nombre}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-muted-foreground">Ctrl/Cmd + clic para elegir varios</p>
        </>
      ) : (
        <input
          value={value.join(", ")}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean),
            )
          }
          className={className ?? CAMPO_CLASES}
          placeholder="Separados por coma"
        />
      )}
    </div>
  );
}
