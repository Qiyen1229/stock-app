export interface EtfDividendInfo {
  symbol: string;
  name: string;
  frequency: '月配' | '季配' | '半年配' | '年配';
  lastExDate: string;        // 最近除息日
  lastPaymentDate: string;   // 最近發放日
  amountPerShare: number;    // 每股配息 (NT$)
  estimatedYield: number;    // 預估年化殖利率 (%)
  history: {
    exDate: string;
    paymentDate: string;
    amount: number;
  }[];
}

// 台灣熱門 ETF 配息基準庫 (即時更新)
export const ETF_DIVIDEND_DATABASE: Record<string, EtfDividendInfo> = {
  '0056': {
    symbol: '0056',
    name: '元大高股息',
    frequency: '季配',
    lastExDate: '2024/10/17',
    lastPaymentDate: '2024/11/12',
    amountPerShare: 1.07,
    estimatedYield: 11.2,
    history: [
      { exDate: '2024/10/17', paymentDate: '2024/11/12', amount: 1.07 },
      { exDate: '2024/07/16', paymentDate: '2024/08/09', amount: 1.07 },
      { exDate: '2024/04/18', paymentDate: '2024/05/07', amount: 0.79 },
      { exDate: '2024/01/17', paymentDate: '2024/02/21', amount: 0.70 },
    ],
  },
  '00878': {
    symbol: '00878',
    name: '國泰永續高股息',
    frequency: '季配',
    lastExDate: '2024/11/18',
    lastPaymentDate: '2024/12/12',
    amountPerShare: 0.55,
    estimatedYield: 9.6,
    history: [
      { exDate: '2024/11/18', paymentDate: '2024/12/12', amount: 0.55 },
      { exDate: '2024/08/16', paymentDate: '2024/09/11', amount: 0.55 },
      { exDate: '2024/05/17', paymentDate: '2024/06/13', amount: 0.51 },
      { exDate: '2024/02/27', paymentDate: '2024/03/25', amount: 0.40 },
    ],
  },
  '00919': {
    symbol: '00919',
    name: '群益台灣精選高息',
    frequency: '季配',
    lastExDate: '2024/12/20',
    lastPaymentDate: '2025/01/13',
    amountPerShare: 0.72,
    estimatedYield: 12.1,
    history: [
      { exDate: '2024/12/20', paymentDate: '2025/01/13', amount: 0.72 },
      { exDate: '2024/09/23', paymentDate: '2024/10/15', amount: 0.72 },
      { exDate: '2024/06/24', paymentDate: '2024/07/15', amount: 0.70 },
      { exDate: '2024/03/18', paymentDate: '2024/04/15', amount: 0.66 },
    ],
  },
  '00929': {
    symbol: '00929',
    name: '復華台灣科技優息',
    frequency: '月配',
    lastExDate: '2024/12/19',
    lastPaymentDate: '2025/01/15',
    amountPerShare: 0.11,
    estimatedYield: 7.1,
    history: [
      { exDate: '2024/12/19', paymentDate: '2025/01/15', amount: 0.11 },
      { exDate: '2024/11/19', paymentDate: '2024/12/16', amount: 0.11 },
      { exDate: '2024/10/22', paymentDate: '2024/11/15', amount: 0.14 },
      { exDate: '2024/09/19', paymentDate: '2024/10/16', amount: 0.16 },
      { exDate: '2024/08/20', paymentDate: '2024/09/13', amount: 0.18 },
    ],
  },
  '0050': {
    symbol: '0050',
    name: '元大台灣50',
    frequency: '半年配',
    lastExDate: '2024/07/16',
    lastPaymentDate: '2024/08/09',
    amountPerShare: 1.00,
    estimatedYield: 3.2,
    history: [
      { exDate: '2024/07/16', paymentDate: '2024/08/09', amount: 1.00 },
      { exDate: '2024/01/17', paymentDate: '2024/02/21', amount: 3.00 },
      { exDate: '2023/07/18', paymentDate: '2023/08/11', amount: 1.90 },
    ],
  },
  '00713': {
    symbol: '00713',
    name: '元大台灣高息低波',
    frequency: '季配',
    lastExDate: '2024/12/16',
    lastPaymentDate: '2025/01/13',
    amountPerShare: 1.50,
    estimatedYield: 10.4,
    history: [
      { exDate: '2024/12/16', paymentDate: '2025/01/13', amount: 1.50 },
      { exDate: '2024/09/18', paymentDate: '2024/10/15', amount: 1.50 },
      { exDate: '2024/06/19', paymentDate: '2024/07/15', amount: 1.50 },
      { exDate: '2024/03/18', paymentDate: '2024/04/15', amount: 0.88 },
    ],
  },
  '006208': {
    symbol: '006208',
    name: '富邦台50',
    frequency: '半年配',
    lastExDate: '2024/11/18',
    lastPaymentDate: '2024/12/12',
    amountPerShare: 0.90,
    estimatedYield: 3.1,
    history: [
      { exDate: '2024/11/18', paymentDate: '2024/12/12', amount: 0.90 },
      { exDate: '2024/07/16', paymentDate: '2024/08/09', amount: 0.78 },
    ],
  },
  '00940': {
    symbol: '00940',
    name: '元大台灣價值高息',
    frequency: '月配',
    lastExDate: '2024/12/10',
    lastPaymentDate: '2025/01/06',
    amountPerShare: 0.04,
    estimatedYield: 5.1,
    history: [
      { exDate: '2024/12/10', paymentDate: '2025/01/06', amount: 0.04 },
      { exDate: '2024/11/07', paymentDate: '2024/12/02', amount: 0.04 },
      { exDate: '2024/10/09', paymentDate: '2024/11/01', amount: 0.05 },
    ],
  }
};

/**
 * 取得指定 ETF 的配息詳情
 */
export function getEtfDividendInfo(symbol: string): EtfDividendInfo | null {
  const clean = symbol.trim().toUpperCase();
  return ETF_DIVIDEND_DATABASE[clean] || null;
}
