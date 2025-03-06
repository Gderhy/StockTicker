export interface StockDataType {
  symbol: string;
  companyName: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  date: Date;
}

export type StockDataRange = "1day" | "1week" | "1month" | "3months" | "1year" | "5years" | "10years" | "all"; 