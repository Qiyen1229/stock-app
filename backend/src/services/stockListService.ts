export interface StockItem {
  symbol: string;
  name: string;
  market: '上市' | '上櫃' | 'ETF';
  industry?: string;
  defaultPrice?: number;
}

// 豐富的台股上市與 ETF 標的庫
export const TAIWAN_STOCKS: StockItem[] = [
  // ETF 熱門標的
  { symbol: '0050', name: '元大台灣50', market: 'ETF', industry: '市值型ETF', defaultPrice: 198.5 },
  { symbol: '0056', name: '元大高股息', market: 'ETF', industry: '高股息ETF', defaultPrice: 38.2 },
  { symbol: '00878', name: '國泰永續高股息', market: 'ETF', industry: '高股息ETF', defaultPrice: 22.8 },
  { symbol: '00919', name: '群益台灣精選高息', market: 'ETF', industry: '高股息ETF', defaultPrice: 23.5 },
  { symbol: '00929', name: '復華台灣科技優息', market: 'ETF', industry: '科技高息ETF', defaultPrice: 18.6 },
  { symbol: '00713', name: '元大台灣高息低波', market: 'ETF', industry: '低波動高息ETF', defaultPrice: 56.4 },
  { symbol: '006208', name: '富邦台50', market: 'ETF', industry: '市值型ETF', defaultPrice: 115.0 },
  { symbol: '00940', name: '元大台灣價值高息', market: 'ETF', industry: '高股息ETF', defaultPrice: 9.35 },
  { symbol: '00939', name: '統一台灣高息動能', market: 'ETF', industry: '高股息ETF', defaultPrice: 14.2 },
  { symbol: '00679B', name: '元大美債20年', market: 'ETF', industry: '債券型ETF', defaultPrice: 29.8 },
  { symbol: '00687B', name: '國泰20年美債', market: 'ETF', industry: '債券型ETF', defaultPrice: 30.5 },
  { symbol: '00937B', name: '群益ESG投等債20+', market: 'ETF', industry: '債券型ETF', defaultPrice: 15.6 },
  { symbol: '00757', name: '統一FANG+', market: 'ETF', industry: '海外科技ETF', defaultPrice: 92.5 },
  { symbol: '00830', name: '國泰費城半導體', market: 'ETF', industry: '海外半導體ETF', defaultPrice: 45.3 },

  // 台股權值股與主流上市標的
  { symbol: '2330', name: '台積電', market: '上市', industry: '半導體業', defaultPrice: 1120.0 },
  { symbol: '2317', name: '鴻海', market: '上市', industry: '其他電子業', defaultPrice: 215.0 },
  { symbol: '2454', name: '聯發科', market: '上市', industry: '半導體業', defaultPrice: 1435.0 },
  { symbol: '2382', name: '廣達', market: '上市', industry: '電腦及週邊設備業', defaultPrice: 295.0 },
  { symbol: '2308', name: '台達電', market: '上市', industry: '電子零組件業', defaultPrice: 398.0 },
  { symbol: '2881', name: '富邦金', market: '上市', industry: '金融保險業', defaultPrice: 91.5 },
  { symbol: '2882', name: '國泰金', market: '上市', industry: '金融保險業', defaultPrice: 66.8 },
  { symbol: '2886', name: '兆豐金', market: '上市', industry: '金融保險業', defaultPrice: 39.5 },
  { symbol: '2891', name: '中信金', market: '上市', industry: '金融保險業', defaultPrice: 37.2 },
  { symbol: '2884', name: '玉山金', market: '上市', industry: '金融保險業', defaultPrice: 28.6 },
  { symbol: '2892', name: '第一金', market: '上市', industry: '金融保險業', defaultPrice: 27.8 },
  { symbol: '2880', name: '華南金', market: '上市', industry: '金融保險業', defaultPrice: 25.4 },
  { symbol: '2885', name: '元大金', market: '上市', industry: '金融保險業', defaultPrice: 33.1 },
  { symbol: '2887', name: '台新金', market: '上市', industry: '金融保險業', defaultPrice: 18.2 },
  { symbol: '2890', name: '永豐金', market: '上市', industry: '金融保險業', defaultPrice: 24.5 },
  { symbol: '5880', name: '合庫金', market: '上市', industry: '金融保險業', defaultPrice: 25.1 },
  { symbol: '2603', name: '長榮', market: '上市', industry: '航運業', defaultPrice: 220.0 },
  { symbol: '2609', name: '陽明', market: '上市', industry: '航運業', defaultPrice: 72.5 },
  { symbol: '2615', name: '萬海', market: '上市', industry: '航運業', defaultPrice: 88.0 },
  { symbol: '2303', name: '聯電', market: '上市', industry: '半導體業', defaultPrice: 44.8 },
  { symbol: '3711', name: '日月光投控', market: '上市', industry: '半導體業', defaultPrice: 165.0 },
  { symbol: '2357', name: '華碩', market: '上市', industry: '電腦及週邊設備業', defaultPrice: 610.0 },
  { symbol: '3231', name: '緯創', market: '上市', industry: '電腦及週邊設備業', defaultPrice: 115.5 },
  { symbol: '2376', name: '技嘉', market: '上市', industry: '電腦及週邊設備業', defaultPrice: 275.0 },
  { symbol: '6669', name: '緯穎', market: '上市', industry: '電腦及週邊設備業', defaultPrice: 2180.0 },
  { symbol: '2408', name: '南亞科', market: '上市', industry: '半導體業', defaultPrice: 42.1 },
  { symbol: '3008', name: '大立光', market: '上市', industry: '光電業', defaultPrice: 2450.0 },
  { symbol: '2412', name: '中華電', market: '上市', industry: '通信網路業', defaultPrice: 124.5 },
  { symbol: '3045', name: '台灣大', market: '上市', industry: '通信網路業', defaultPrice: 113.0 },
  { symbol: '4904', name: '遠傳', market: '上市', industry: '通信網路業', defaultPrice: 87.5 },
  { symbol: '1301', name: '台塑', market: '上市', industry: '塑膠工業', defaultPrice: 45.2 },
  { symbol: '1303', name: '南亞', market: '上市', industry: '塑膠工業', defaultPrice: 38.6 },
  { symbol: '1326', name: '台化', market: '上市', industry: '塑膠工業', defaultPrice: 35.8 },
  { symbol: '6505', name: '台塑化', market: '上市', industry: '油電燃氣業', defaultPrice: 47.9 },
  { symbol: '2002', name: '中鋼', market: '上市', industry: '鋼鐵工業', defaultPrice: 21.8 },
  { symbol: '1101', name: '台泥', market: '上市', industry: '水泥工業', defaultPrice: 32.4 },
  { symbol: '1216', name: '統一', market: '上市', industry: '食品工業', defaultPrice: 84.6 },
  { symbol: '2912', name: '統一超', market: '上市', industry: '貿易百貨業', defaultPrice: 285.0 },
  { symbol: '2207', name: '和泰車', market: '上市', industry: '汽車工業', defaultPrice: 650.0 },
  { symbol: '1476', name: '儒鴻', market: '上市', industry: '紡織纖維', defaultPrice: 535.0 },
  { symbol: '9910', name: '豐泰', market: '上市', industry: '其他業', defaultPrice: 145.0 },
  { symbol: '2345', name: '智邦', market: '上市', industry: '通信網路業', defaultPrice: 580.0 },
  { symbol: '3034', name: '聯詠', market: '上市', industry: '半導體業', defaultPrice: 512.0 },
  { symbol: '3037', name: '欣興', market: '上市', industry: '電子零組件業', defaultPrice: 168.0 },
  { symbol: '2379', name: '瑞昱', market: '上市', industry: '半導體業', defaultPrice: 495.0 },
  { symbol: '3661', name: '世芯-KY', market: '上市', industry: '半導體業', defaultPrice: 2050.0 },
  { symbol: '3443', name: '創意', market: '上市', industry: '半導體業', defaultPrice: 1180.0 },
  { symbol: '6415', name: '矽力*-KY', market: '上市', industry: '半導體業', defaultPrice: 460.0 },
  { symbol: '5904', name: '寶雅', market: '上櫃', industry: '貿易百貨業', defaultPrice: 520.0 },
  { symbol: '8069', name: '元太', market: '上櫃', industry: '光電業', defaultPrice: 275.0 },
  { symbol: '6488', name: '環球晶', market: '上櫃', industry: '半導體業', defaultPrice: 430.0 }
];

export function searchStocks(query: string): StockItem[] {
  if (!query || !query.trim()) {
    return TAIWAN_STOCKS.slice(0, 20);
  }
  const clean = query.trim().toLowerCase();
  return TAIWAN_STOCKS.filter(
    s => s.symbol.toLowerCase().includes(clean) || s.name.toLowerCase().includes(clean)
  );
}

export function findStock(symbol: string): StockItem | undefined {
  return TAIWAN_STOCKS.find(s => s.symbol === symbol.trim());
}
