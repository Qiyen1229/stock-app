export type CompoundFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface CompoundInput {
  frequency: CompoundFrequency;
  periodicAmount: number; // 每次定期投入金額
  initialAmount: number;  // 初始本金
  annualRate: number;     // 年化報酬率 (%)
  years: number;          // 投資年數
}

export interface CompoundYearResult {
  year: number;
  totalPrincipal: number; // 累計總本金
  totalInterest: number;  // 累計投資收益
  totalAsset: number;     // 總資產
  roi: number;            // 總報酬率 (%)
}

export interface CompoundCalculationResult {
  totalPrincipal: number;
  totalProfit: number;
  finalAsset: number;
  totalRoi: number;
  yearlyBreakdown: CompoundYearResult[];
}

export function calculateCompoundInterest(input: CompoundInput): CompoundCalculationResult {
  const { frequency, periodicAmount, initialAmount, annualRate, years } = input;

  let periodsPerYear = 12;
  if (frequency === 'DAILY') periodsPerYear = 365;
  else if (frequency === 'WEEKLY') periodsPerYear = 52;
  else if (frequency === 'MONTHLY') periodsPerYear = 12;
  else if (frequency === 'YEARLY') periodsPerYear = 1;

  const ratePerPeriod = (annualRate / 100) / periodsPerYear;
  const yearlyBreakdown: CompoundYearResult[] = [];

  for (let y = 1; y <= years; y++) {
    const totalPeriods = y * periodsPerYear;
    let finalAsset = 0;
    const totalPeriodicInvested = periodicAmount * totalPeriods;
    const currentPrincipal = initialAmount + totalPeriodicInvested;

    if (ratePerPeriod === 0) {
      finalAsset = initialAmount + totalPeriodicInvested;
    } else {
      // FV = PV * (1 + r)^N + PMT * [((1 + r)^N - 1) / r]
      const growthFactor = Math.pow(1 + ratePerPeriod, totalPeriods);
      const pvFuture = initialAmount * growthFactor;
      const pmtFuture = periodicAmount * ((growthFactor - 1) / ratePerPeriod);
      finalAsset = pvFuture + pmtFuture;
    }

    const totalInterest = Math.max(0, finalAsset - currentPrincipal);
    const roi = currentPrincipal > 0 ? (totalInterest / currentPrincipal) * 100 : 0;

    yearlyBreakdown.push({
      year: y,
      totalPrincipal: Math.round(currentPrincipal),
      totalInterest: Math.round(totalInterest),
      totalAsset: Math.round(finalAsset),
      roi: Number(roi.toFixed(2)),
    });
  }

  const last = yearlyBreakdown[yearlyBreakdown.length - 1] || {
    totalPrincipal: initialAmount,
    totalInterest: 0,
    totalAsset: initialAmount,
    roi: 0,
  };

  return {
    totalPrincipal: last.totalPrincipal,
    totalProfit: last.totalInterest,
    finalAsset: last.totalAsset,
    totalRoi: last.roi,
    yearlyBreakdown,
  };
}
