
import React from 'react';
import { CalcItem, ActiveField } from '../types';

interface CalculatorNoteProps {
  title: string;
  items: CalcItem[];
  activeField: ActiveField | null;
  onFieldSelect: (index: number, field: 'label' | 'formula' | 'title') => void;
  onTextChange: (index: number, field: 'label' | 'title', value: string) => void;
}

const CalculatorNote: React.FC<CalculatorNoteProps> = ({ title, items, activeField, onFieldSelect, onTextChange }) => {
  
  const evaluateFormula = (formula: string): number => {
    try {
      const sanitized = formula.replace(/[^-0-9+*/.]/g, '');
      if (!sanitized) return 0;
      const result = new Function(`return ${sanitized}`)();
      return typeof result === 'number' ? result : 0;
    } catch (e) {
      return 0;
    }
  };

  const formatDisplay = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num).replace(/,/g, '.');
  };

  const renderFormula = (formula: string) => {
    if (!formula) return <span className="text-gray-800 opacity-30">---</span>;
    const parts = formula.split(/([+\-*/])/);
    return parts.map((part, i) => {
      if (['+', '-', '*', '/'].includes(part)) {
        return <span key={i} className="text-yellow-400 mx-1">{part}</span>;
      }
      return <span key={i} className="text-cyan-400">{formatDisplay(part)}</span>;
    });
  };

  const results = items.map(item => evaluateFormula(item.formula));
  const grandTotal = results.reduce((acc, curr) => acc + curr, 0);

  const isTitleActive = activeField?.field === 'title';

  return (
    <div 
      id="calculator-capture"
      className="w-full h-full flex flex-col bg-[#121212] text-white font-bold oswald uppercase border-2 border-cyan-900/50 shadow-2xl relative select-none overflow-hidden"
    >
      {/* Header with Title and Total */}
      <div className="grid grid-cols-12 h-10 flex-shrink-0 items-center border-b border-cyan-400/30">
        <div className={`col-span-8 h-full flex items-center px-4 transition-colors ${isTitleActive ? 'bg-white/5' : ''}`}>
          <input
            className="bg-transparent w-full focus:outline-none text-white text-sm tracking-widest font-black placeholder-gray-800"
            value={title}
            placeholder="NOTE TITLE"
            onChange={(e) => onTextChange(0, 'title', e.target.value)}
            onFocus={() => onFieldSelect(0, 'title')}
            spellCheck={false}
          />
        </div>
        <div className="col-span-4 text-center text-white border-l border-cyan-400 h-full flex items-center justify-center text-[10px] tracking-widest bg-white/5">
          TOTAL
        </div>
      </div>

      {/* Vertical Divider Line - Extends from top of header to grand total */}
      <div className="absolute top-0 bottom-12 left-[66.666%] w-[1px] bg-cyan-400 z-10"></div>

      {/* Items List */}
      <div className="flex-grow flex flex-col min-h-0">
        {items.map((item, idx) => {
          const result = results[idx];
          const isNeg = result < 0;
          const isActiveLabel = activeField?.index === idx && activeField.field === 'label';
          const isActiveFormula = activeField?.index === idx && activeField.field === 'formula';

          return (
            <div 
              key={item.id} 
              className={`grid grid-cols-12 flex-grow items-center border-b border-cyan-900/10 min-h-0 ${isActiveLabel || isActiveFormula ? 'bg-cyan-500/10' : ''}`}
            >
              {/* Left Side: Label + Formula */}
              <div className="col-span-8 flex items-center px-2 gap-2 h-full overflow-hidden">
                <input
                  className={`bg-transparent focus:outline-none w-16 md:w-20 shrink-0 text-white placeholder-gray-800 transition-colors text-xs md:text-sm ${isActiveLabel ? 'text-white border-b border-white/50 bg-white/5' : ''}`}
                  value={item.label}
                  placeholder=""
                  onChange={(e) => onTextChange(idx, 'label', e.target.value)}
                  onFocus={() => onFieldSelect(idx, 'label')}
                  spellCheck={false}
                />
                <div 
                  onClick={() => onFieldSelect(idx, 'formula')}
                  className={`flex-grow flex items-center h-full cursor-pointer px-1 truncate text-xs md:text-base ${isActiveFormula ? 'border-b border-cyan-400 bg-cyan-400/5' : ''}`}
                >
                  {renderFormula(item.formula)}
                </div>
              </div>

              {/* Right Side: Calculated Result */}
              <div className="col-span-4 text-right pr-3 font-black h-full flex items-center justify-end text-sm md:text-lg">
                <span className={isNeg ? 'text-rose-400' : 'text-cyan-400'}>
                  {(result !== 0 || item.formula) ? (isNeg ? `- ${formatDisplay(Math.abs(result))}` : formatDisplay(result)) : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand Total Footer */}
      <div className="h-12 flex-shrink-0 border-t-2 border-cyan-400 grid grid-cols-12 items-center bg-black">
        <div className="col-span-8 text-right pr-6 text-white text-[10px] md:text-xs tracking-widest opacity-80">
          GRAND TOTAL
        </div>
        <div className="col-span-4 text-right pr-3 text-cyan-400 text-lg md:text-xl font-black tracking-tighter">
          {formatDisplay(grandTotal)}
        </div>
      </div>
    </div>
  );
};

export default CalculatorNote;
