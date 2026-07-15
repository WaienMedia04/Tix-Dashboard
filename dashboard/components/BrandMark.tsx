interface BrandMarkProps {
  /** "onDark" recolorea la marca para fondos oscuros/vibrantes (ej. Iridescence). */
  variant?: "default" | "onDark";
}

export function BrandMark({ variant = "default" }: BrandMarkProps) {
  const onDark = variant === "onDark";
  return (
    <p className={`text-base font-semibold ${onDark ? "text-white" : "text-foreground"}`}>
      TalentiX <span className={onDark ? "text-violet-200" : "text-primary"}>RD</span>
      <sup className={`ml-0.5 text-[10px] ${onDark ? "text-white/60" : "text-muted-foreground"}`}>™</sup>
    </p>
  );
}
