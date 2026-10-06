import { useMemo, useState } from "react";
import type { Plot } from "@/lib/types";
import { formatNaira, sizeLabel } from "@/lib/format";

// Payment estimate card. Rendered as the third tile of the plots grid.
export function PaymentCalculator({ plots }: { plots: Plot[] }) {
  const payablePlots = plots.filter((p) => p.price > 0);
  const [plotId, setPlotId] = useState(payablePlots[0]?.id ?? "");
  const [months, setMonths] = useState(6);
  const [deposit, setDeposit] = useState(30);

  const plot = payablePlots.find((p) => p.id === plotId) ?? payablePlots[0];

  const { depositAmount, monthlyAmount } = useMemo(() => {
    if (!plot) return { depositAmount: 0, monthlyAmount: 0 };
    const down = Math.round((plot.price * deposit) / 100);
    const remaining = plot.price - down;
    return {
      depositAmount: down,
      monthlyAmount: Math.round(months > 0 ? remaining / months : remaining),
    };
  }, [plot, months, deposit]);

  if (!plot) return null;

  return (
    <aside className="calculator-card">
      <p className="eyebrow">PAYMENT ESTIMATE</p>
      <h3>Plan at your pace.</h3>
      <label>
        Plot size
        <select value={plot.id} onChange={(event) => setPlotId(event.target.value)}>
          {payablePlots.map((p) => (
            <option key={p.id} value={p.id}>
              {sizeLabel(p)} ({formatNaira(p.price)})
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>
          Initial deposit <b>{deposit}%</b>
        </span>
        <input
          max={70}
          min={20}
          onChange={(event) => setDeposit(Number(event.target.value))}
          step={5}
          type="range"
          value={deposit}
        />
      </label>
      <label>
        Instalment period
        <select value={months} onChange={(event) => setMonths(Number(event.target.value))}>
          <option value={3}>3 months</option>
          <option value={6}>6 months</option>
          <option value={12}>12 months</option>
        </select>
      </label>
      <div className="estimate">
        <div>
          <span>Initial payment</span>
          <strong>{formatNaira(depositAmount)}</strong>
        </div>
        <div>
          <span>Then {months} payments of</span>
          <strong>{formatNaira(monthlyAmount)}</strong>
        </div>
      </div>
      <small>Estimate only. Final terms are confirmed by an advisor.</small>
    </aside>
  );
}
