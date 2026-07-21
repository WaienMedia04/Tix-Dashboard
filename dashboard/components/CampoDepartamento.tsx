import type { DepartamentoDefinicion } from "@/lib/api";

const CAMPO_CLASES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

/**
 * Si Talentix ya configuró departamentos para esta empresa (panel admin),
 * se elige de esa lista — evita el desajuste de texto libre entre el
 * departamento de un empleado y el que gestiona un Gerente. Si la empresa
 * todavía no tiene ninguno configurado, cae a texto libre (compatibilidad).
 */
export function CampoDepartamento({
  label,
  value,
  onChange,
  departamentos,
  required,
  className,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  departamentos: DepartamentoDefinicion[];
  required?: boolean;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</label>
      {departamentos.length > 0 ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className ?? CAMPO_CLASES}
          required={required}
        >
          <option value="">Sin especificar</option>
          {departamentos.map((d) => (
            <option key={d.id} value={d.nombre}>
              {d.nombre}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className ?? CAMPO_CLASES}
          placeholder="Opcional"
          required={required}
        />
      )}
    </div>
  );
}
