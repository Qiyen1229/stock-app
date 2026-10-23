/**
 * 格式化台幣金額：NT$ 123,456 (可選小數位)
 */
export function formatCurrency(amount: number, decimals: number = 0): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'NT$ 0';
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const sign = amount < 0 ? '-' : '';
  return `${sign}NT$ ${formatted}`;
}

/**
 * 格式化股票即時價格：NT$ 1,120.00
 */
export function formatStockPrice(price: number): string {
  if (isNaN(price)) return 'NT$ 0.00';
  return `NT$ ${price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * 格式化股數：1,000 股
 */
export function formatShares(shares: number): string {
  if (isNaN(shares)) return '0 股';
  return `${shares.toLocaleString('en-US')} 股`;
}

/**
 * 格式化百分比：+17.89% 或 -3.21%
 */
export function formatPercent(percent: number, showPlus: boolean = true): string {
  if (isNaN(percent)) return '0.00%';
  const prefix = percent > 0 && showPlus ? '+' : '';
  return `${prefix}${percent.toFixed(2)}%`;
}

/**
 * 台灣股市慣用顏色 Class (紅漲綠跌)
 */
export function getProfitClass(val: number): string {
  if (val > 0) return 'text-up';
  if (val < 0) return 'text-down';
  return 'text-neutral';
}

export function getProfitBadgeClass(val: number): string {
  if (val > 0) return 'badge-up';
  if (val < 0) return 'badge-down';
  return '';
}
