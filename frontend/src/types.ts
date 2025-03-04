export interface StockDataType {
  symbol: string;
  close: number;
  companyName: string;
  high: number;
  lastUpdate: string;
  low: number;
  open: number;
  volume: number;
  date: string;
}

export type StockDataRange = "1day" | "1week" | "1month" | "3months" | "1year" | "5years" | "10years" | "all"; 