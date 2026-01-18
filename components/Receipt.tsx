
import React from 'react';
import { ReceiptData, ActiveField } from '../types';

interface ReceiptProps {
  data: ReceiptData;
  activeField: ActiveField | null;
  onFieldSelect: (index: number, field: 'currency' | 'amount' | 'rate') => void;
  onTextChange: (field: 'customerName' | 'customerAddress', value: string) => void;
  onItemChange: (index: number, field: 'currency', value: string) => void;
  onTypeToggle: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ data, activeField, onFieldSelect, onTextChange, onItemChange, onTypeToggle }) => {
  const formatNumber = (val: string) => {
    if (!val) return "";
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    
    const endsWithDot = val.endsWith('.');
    const hasDecimal = val.includes('.');
    const decimalCount = hasDecimal ? val.split('.')[1].length : 0;
    
    const formatted = new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: decimalCount,
      maximumFractionDigits: 2
    }).format(num);

    // If it ends with dot, append the ID separator (comma)
    return endsWithDot ? `${formatted},` : formatted;
  };

  const calculateGrandTotal = () => {
    return data.items.reduce((acc, item) => {
      const amount = parseFloat(item.amount);
      const rate = parseFloat(item.rate);
      if (!isNaN(amount) && !isNaN(rate)) {
        return acc + (amount * rate);
      }
      return acc;
    }, 0);
  };

  const formatTotal = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const bgColor = data.type === 'SELL' ? '#fdf9c4' : '#bae6fd';

  return (
    <div 
      id="receipt-capture" 
      style={{ backgroundColor: bgColor }} 
      className="w-full max-w-md mx-auto p-2 md:p-3 shadow-2xl border-b-4 border-gray-400 text-black transition-colors duration-300 flex flex-col"
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-grow">
          <h1 className="text-xl md:text-2xl font-black oswald leading-none uppercase tracking-tighter border-b-2 border-black inline-block mb-1">
            {data.companyName}
          </h1>
          <h2 className="text-base md:text-lg font-bold oswald leading-tight">
            {data.companySub}
          </h2>
          <p className="text-[9px] md:text-[10px] font-bold oswald mt-0.5">
            Head Office : {data.address}
          </p>
        </div>
        
        <button 
          onClick={onTypeToggle}
          className="border-2 border-black p-1 md:p-2 flex items-center justify-center min-w-[60px] min-h-[60px] md:min-w-[70px] md:min-h-[70px] hover:bg-black/5 active:bg-black/10 transition-colors bg-white/10 ml-2"
        >
          <span className="text-2xl md:text-3xl font-black oswald leading-none">{data.type}</span>
        </button>
      </div>

      {/* Details Section */}
      <div className="flex justify-between items-end mb-2 text-[11px] md:text-xs oswald uppercase font-bold">
        <div className="flex-grow space-y-1">
          <div className="flex items-center gap-1">
            <span className="w-12">NAME</span>
            <span>:</span>
            <div className="flex-grow border-b border-black -mb-0.5">
              <input 
                className="bg-transparent w-full focus:outline-none px-1"
                value={data.customerName}
                onChange={(e) => onTextChange('customerName', e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-12">ADDRESS</span>
            <span>:</span>
            <div className="flex-grow border-b border-black -mb-0.5">
              <input 
                className="bg-transparent w-full focus:outline-none px-1"
                value={data.customerAddress}
                onChange={(e) => onTextChange('customerAddress', e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end ml-2 min-w-[70px]">
          <span className="text-[9px] opacity-80">Date:</span>
          <span className="text-lg font-black tracking-tighter leading-none">{data.date}</span>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 border-2 border-black text-center text-[9px] md:text-[10px] oswald font-black bg-black/10">
        <div className="col-span-2 border-r-2 border-black py-0.5">CURR</div>
        <div className="col-span-3 border-r-2 border-black py-0.5">AMOUNT</div>
        <div className="col-span-3 border-r-2 border-black py-0.5">RATE</div>
        <div className="col-span-4 py-0.5">TOTAL Rp.</div>
      </div>

      {/* Table Rows */}
      <div className="flex flex-col border-x-2 border-black">
        {data.items.map((item, idx) => {
          const amount = parseFloat(item.amount) || 0;
          const rate = parseFloat(item.rate) || 0;
          const total = amount * rate;
          const isCurrActive = activeField?.index === idx && activeField.field === 'currency';
          
          return (
            <div key={item.id} className="grid grid-cols-12 border-b border-black text-[12px] md:text-[13px] oswald font-bold h-7 md:h-8 items-center">
              <div className={`col-span-2 border-r-2 border-black h-full flex items-center justify-center transition-colors ${isCurrActive ? 'bg-cyan-500/30' : ''}`}>
                <input
                  type="text"
                  className="bg-transparent w-full h-full text-center focus:outline-none uppercase"
                  value={item.currency}
                  onChange={(e) => onItemChange(idx, 'currency', e.target.value)}
                  onFocus={() => onFieldSelect(idx, 'currency')}
                  placeholder="---"
                />
              </div>
              <div 
                onClick={() => onFieldSelect(idx, 'amount')}
                className={`col-span-3 border-r-2 border-black h-full flex items-center justify-end px-1.5 cursor-pointer transition-colors ${activeField?.index === idx && activeField.field === 'amount' ? 'bg-cyan-500/30' : ''}`}
              >
                {formatNumber(item.amount)}
              </div>
              <div 
                onClick={() => onFieldSelect(idx, 'rate')}
                className={`col-span-3 border-r-2 border-black h-full flex items-center cursor-pointer transition-colors ${activeField?.index === idx && activeField.field === 'rate' ? 'bg-cyan-500/30' : ''}`}
              >
                <div className="grid grid-cols-4 w-full pointer-events-none">
                  <span className="col-span-1 pl-1 text-[7px] self-center opacity-70">Rp.</span>
                  <span className="col-span-3 text-right pr-1">{formatNumber(item.rate)}</span>
                </div>
              </div>
              <div className="col-span-4 h-full flex items-center bg-black/5">
                <div className="grid grid-cols-4 w-full">
                  <span className="col-span-1 pl-1 text-[7px] self-center opacity-70">Rp.</span>
                  <span className="col-span-3 text-right pr-1">{total > 0 ? formatTotal(total) : ""}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand Total Row */}
      <div className="grid grid-cols-12 h-8 md:h-9 border-x-2 border-b-2 border-black">
        <div className="col-span-8 flex items-center justify-end pr-2 text-[10px] md:text-xs font-black oswald uppercase bg-black/20">
          GRAND TOTAL
        </div>
        <div className="col-span-4 h-full flex items-center bg-white/50">
          <div className="grid grid-cols-4 w-full">
            <span className="col-span-1 pl-1 text-[8px] font-black">Rp.</span>
            <span className="col-span-3 text-right pr-1 font-black text-xs md:text-base">{formatTotal(calculateGrandTotal())}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
