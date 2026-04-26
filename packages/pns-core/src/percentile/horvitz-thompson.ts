/**
 * Quantile ponderado (Horvitz-Thompson). Para um conjunto de observações
 * (value_i, weight_i) — onde weight_i é o peso amostral PNS (`w_pes`) —
 * retorna o valor v tal que Σ w[v_i ≤ v] / Σ w == p.
 *
 * Referência metodológica: `survey::svyquantile` (R) e `samplics` (Python).
 */
export function weightedQuantile(
  observations: ReadonlyArray<{ value: number; weight: number }>,
  p: number,
): number {
  if (p < 0 || p > 1) throw new RangeError(`p must be in [0, 1], got ${p}`);
  if (observations.length === 0) throw new RangeError('observations is empty');

  const sorted = [...observations].sort((a, b) => a.value - b.value);
  const totalWeight = sorted.reduce((s, o) => s + o.weight, 0);
  if (totalWeight <= 0) throw new RangeError('sum of weights must be > 0');

  const target = p * totalWeight;
  let cumulative = 0;
  for (let i = 0; i < sorted.length; i++) {
    cumulative += sorted[i]!.weight;
    if (cumulative >= target) return sorted[i]!.value;
  }
  return sorted[sorted.length - 1]!.value;
}

/**
 * Posição percentil (0–100) de `value` em uma distribuição ponderada.
 * Retorna a fração de peso amostral acumulado em observações com valor ≤ value.
 */
export function weightedPercentileRank(
  observations: ReadonlyArray<{ value: number; weight: number }>,
  value: number,
): number {
  if (observations.length === 0) throw new RangeError('observations is empty');
  let totalWeight = 0;
  let belowOrEqual = 0;
  for (const o of observations) {
    totalWeight += o.weight;
    if (o.value <= value) belowOrEqual += o.weight;
  }
  if (totalWeight <= 0) throw new RangeError('sum of weights must be > 0');
  return (belowOrEqual / totalWeight) * 100;
}
