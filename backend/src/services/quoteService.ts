import { findStock } from './stockListService';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  updatedAt: string;
  status: '即時' | '延遲' | '最後交易價格';
}

export interface HistoricalPoint {
  date: string;
  price: number;
}

// 記憶體快取以避免頻繁打擊外部 API
interface CacheEntry {
  quote: StockQuote;
  timestamp: number;
}

const quoteCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 1000; // 30 秒快取

/**
 * 格式化台北時間
 */
function getFormattedTime(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${y}/${m}/${d} ${h}:${min}`;
}

/**
 * 從 Yahoo Finance 取得真實即時台灣股價 (支援上市 .TW 與上櫃 .TWO)
 */
async function fetchYahooQuote(symbol: string): Promise<StockQuote | null> {
  const stockInfo = findStock(symbol);
  const isOtc = stockInfo?.market === '上櫃';
  const symbolsToTry = isOtc ? [`${symbol}.TWO`, `${symbol}.TW`] : [`${symbol}.TW`, `${symbol}.TWO`];

  for (const symWithSuffix of symbolsToTry) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symWithSuffix}?interval=1d&range=1d`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) continue;

      const data = await response.json();
      const result = data?.chart?.result?.[0];
      if (!result || !result.meta) continue;

      const meta = result.meta;
      const currentPrice = Number(meta.regularMarketPrice);
      if (isNaN(currentPrice) || currentPrice <= 0) continue;

      const previousClose = Number(meta.chartPreviousClose || currentPrice);
      const change = Number((currentPrice - previousClose).toFixed(2));
      const changePercent = previousClose > 0 ? Number(((change / previousClose) * 100).toFixed(2)) : 0;
      const open = Number(meta.regularMarketOpen || previousClose);
      const high = Number(meta.regularMarketDayHigh || currentPrice);
      const low = Number(meta.regularMarketDayLow || currentPrice);
      const volume = Number(meta.regularMarketVolume || 0);

      const marketTime = meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000) : new Date();

      return {
        symbol,
        name: stockInfo?.name || symbol,
        price: currentPrice,
        change,
        changePercent,
        open,
        high,
        low,
        previousClose,
        volume,
        updatedAt: getFormattedTime(marketTime),
        status: '即時',
      };
    } catch (e) {
      // 嘗試下一個後綴
    }
  }

  return null;
}

/**
 * 取得股票或 ETF 即時報價
 */
export async function getQuote(symbol: string): Promise<StockQuote> {
  const cleanSymbol = symbol.trim().toUpperCase();
  const now = Date.now();

  const cached = quoteCache.get(cleanSymbol);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.quote;
  }

  // 從真實 Yahoo Finance 即時行情 API 獲取
  try {
    const realQuote = await fetchYahooQuote(cleanSymbol);
    if (realQuote) {
      quoteCache.set(cleanSymbol, { quote: realQuote, timestamp: now });
      return realQuote;
    }
  } catch (error) {
    console.error(`獲取真實行情出錯 (${cleanSymbol}):`, error);
  }

  // 若外部 API 逾時但有快取則返回最近一次真實快取
  if (cached) {
    return {
      ...cached.quote,
      status: '最後交易價格',
    };
  }

  // 若查無資料則返回基本預設
  const stockInfo = findStock(cleanSymbol);
  return {
    symbol: cleanSymbol,
    name: stockInfo?.name || cleanSymbol,
    price: 0,
    change: 0,
    changePercent: 0,
    open: 0,
    high: 0,
    low: 0,
    previousClose: 0,
    volume: 0,
    updatedAt: getFormattedTime(),
    status: '最後交易價格',
  };
}

/**
 * 批量獲取多檔真實報價
 */
export async function getBatchQuotes(symbols: string[]): Promise<Record<string, StockQuote>> {
  const results: Record<string, StockQuote> = {};
  await Promise.all(
    symbols.map(async (s) => {
      try {
        results[s] = await getQuote(s);
      } catch (e) {
        console.error(`Error fetching quote for ${s}:`, e);
      }
    })
  );
  return results;
}

/**
 * 從 Yahoo Finance 取得真實歷史走勢圖資料 (1D, 1W, 1M, 3M, 6M, 1Y)
 */
export async function getRealHistoricalData(symbol: string, timeframe: string = '1M'): Promise<HistoricalPoint[]> {
  const cleanSymbol = symbol.trim().toUpperCase();
  const stockInfo = findStock(cleanSymbol);
  const isOtc = stockInfo?.market === '上櫃';
  const symWithSuffix = `${cleanSymbol}.${isOtc ? 'TWO' : 'TW'}`;

  let range = '1mo';
  let interval = '1d';

  switch (timeframe) {
    case '1D':
      range = '1d';
      interval = '5m';
      break;
    case '1W':
      range = '5d';
      interval = '15m';
      break;
    case '1M':
      range = '1mo';
      interval = '1d';
      break;
    case '3M':
      range = '3mo';
      interval = '1d';
      break;
    case '6M':
      range = '6mo';
      interval = '1wk';
      break;
    case '1Y':
      range = '1y';
      interval = '1wk';
      break;
    default:
      range = '1mo';
      interval = '1d';
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symWithSuffix}?range=${range}&interval=${interval}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const result = data?.chart?.result?.[0];
      if (result && result.timestamp && result.indicators?.quote?.[0]?.close) {
        const timestamps: number[] = result.timestamp;
        const closes: (number | null)[] = result.indicators.quote[0].close;

        const points: HistoricalPoint[] = [];
        for (let i = 0; i < timestamps.length; i++) {
          const price = closes[i];
          if (price !== null && price !== undefined && !isNaN(price)) {
            const d = new Date(timestamps[i] * 1000);
            const dateStr = timeframe === '1D' || timeframe === '1W'
              ? `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
              : `${d.getMonth() + 1}/${d.getDate()}`;
            points.push({ date: dateStr, price: Number(price.toFixed(2)) });
          }
        }

        if (points.length > 0) {
          return points;
        }
      }
    }
  } catch (e) {
    console.error(`獲取歷史行情失敗 (${symbol}):`, e);
  }

  // Fallback: 根據當前報價回傳當前價格點
  const currentQuote = await getQuote(symbol);
  return [
    { date: '昨收', price: currentQuote.previousClose },
    { date: '最新', price: currentQuote.price },
  ];
}
