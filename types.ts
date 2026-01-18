
export interface LineItem {
  id: string;
  currency: string;
  amount: string;
  rate: string;
}

export interface CalcItem {
  id: string;
  label: string;
  formula: string;
}

export type TransactionType = 'SELL' | 'BUY';
export type ViewMode = 'RECEIPT' | 'CALCULATOR';

export interface ReceiptData {
  companyName: string;
  companySub: string;
  address: string;
  customerName: string;
  customerAddress: string;
  date: string;
  items: LineItem[];
  type: TransactionType;
}

export type ActiveField = {
  index: number;
  field: 'currency' | 'amount' | 'rate' | 'label' | 'formula' | 'title';
};
