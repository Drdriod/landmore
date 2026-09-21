import { useMemo, useState } from "react";
import type { Plot } from "@/lib/types";

function formatNaira(n: number) {
  return `₦${Math.round(n).toLocaleString("en-NG")}`;
}

export function PaymentCalculator({ plots }: { plots: Plot[] }) {
  const payablePlots = plots.filter((p) => p.price > 0);
  const [plotId, setPlotId] = useState(payablePlots[0]?.id ?? "");
  const [months, setMonths] = useState(6);
  const [downPercent, setDownPercent] = useState(30);

  const plot = payablePlots.find((p) => p.id === plotId) ?? payablePlots[0];

  const { downPayment, monthly, total } = useMemo(() => {
    if (!plot) return { downPayment: 0, monthly: 0, total: 0 };
    const price = plot.price;
    const down = (price * downPercent) / 100;
    const remaining = price - down;
    return {
      downPayment: down,
      monthly: months > 0 ? remaining / months : remaining,
      total: price,
    };
  }, [plot, months, downPercent]);

  if (!plot) return null;

  return (
    <div className="dv-calc">
      <div className="dv-calc-inputs">
        <div className="dv-calc-field">
          <label>Plot Size</label>
          <select value={plot.id} onChange={(e) => setPlotId(e.target.value)}>
            {payablePlots.map((p) => (
              <option key={p.id} value={p.id}>
                {p.size_sqm} {p.unit_label} — {formatNaira(p.price)}
              </option>
            ))}
          </select>
        </div>
        <div className="dv-calc-field">
          <label>Down Payment: {downPercent}%</label>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={downPercent}
            onChange={(e) => setDownPercent(Number(e.target.value))}
          />
        </div>
        <div className="dv-calc-field">
          <label>Instalment Period</label>
          <select value={months} onChange={(e) => setMonths(Number(e.target.value))}>
            <option value={3}>3 months</option>
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
          </select>
        </div>
      </div>
      <div className="dv-calc-result">
        <div>
          <span>Plot Price</span>
          <strong>{formatNaira(total)}</strong>
        </div>
        <div>
          <span>Down Payment ({downPercent}%)</span>
          <strong>{formatNaira(downPayment)}</strong>
        </div>
        <div className="dv-calc-highlight">
          <span>Then Monthly For {months} Months</span>
          <strong>{formatNaira(monthly)}</strong>
        </div>
      </div>
      <p className="dv-calc-note">
        Estimate only — final terms are confirmed with your advisor. No interest is added by default.
      </p>
    </div>
  );
}
