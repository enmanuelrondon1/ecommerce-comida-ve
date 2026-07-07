// src/components/PriceTag.tsx

interface PriceTagProps {
  usd: number;
  bs: number;
  unit?: string; // ej: "kg", "unidad" — se muestra chico junto al precio
  rotate?: number; // grados de inclinación, default -2
  fromVariants?: boolean; // true si el precio es "desde" (producto con variantes)
}

export default function PriceTag({
  usd,
  bs,
  unit,
  rotate = -2,
  fromVariants = false,
}: PriceTagProps) {
  const formattedBs = new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(bs);

  // Separamos en parte entera y decimales para darle más peso visual al número
  // principal — patrón típico de etiquetas de precio reales.
  const [bsWhole, bsDecimals] = formattedBs.split(",");

  const formattedUsd = usd.toFixed(2);

  return (
    <div
      className="relative inline-block bg-[var(--color-yellow)] text-[var(--color-ink)] px-3 py-2 shadow-[2px_2px_0_var(--color-ink)]"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {/* "hueco" de la etiqueta, como si estuviera colgada */}
      <span className="absolute -top-1.5 left-2.5 h-2.5 w-2.5 rounded-full bg-[var(--color-bg)] border border-[var(--color-ink)]" />

      <div className="font-[family-name:var(--font-mono)] leading-none">
        {fromVariants && (
          <span className="block text-[9px] uppercase tracking-wide opacity-70 mb-0.5">
            Desde
          </span>
        )}
        <span className="text-lg font-semibold">
          Bs {bsWhole}
          <span className="text-[13px] font-normal opacity-70">,{bsDecimals}</span>
        </span>
        <span className="block text-[11px] opacity-80 mt-0.5">
          ${formattedUsd}
          {unit ? ` / ${unit}` : ""}
        </span>
      </div>
    </div>
  );
}
