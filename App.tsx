
import React, { useState, useCallback, useEffect } from 'react';
import Receipt from './components/Receipt';
import Keypad from './components/Keypad';
import CalculatorNote from './components/CalculatorNote';
import { ReceiptData, ActiveField, ViewMode, CalcItem } from './types';
import * as htmlToImage from 'html-to-image';

const App: React.FC = () => {
  const getDeviceDate = () => {
    return new Intl.DateTimeFormat('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit' 
    }).format(new Date());
  };

  const [viewMode, setViewMode] = useState<ViewMode>('RECEIPT');

  // Receipt State
  const [receiptData, setReceiptData] = useState<ReceiptData>({
    companyName: "PT. DINAR MITRA PRATAMA",
    companySub: "Authorized Money Changer",
    address: "Jl. Bypass Ngurah Rai No.536 B, Sanur",
    customerName: "",
    customerAddress: "",
    date: getDeviceDate(),
    type: 'SELL',
    items: Array.from({ length: 7 }, (_, i) => ({
      id: `item-${i}`,
      currency: "",
      amount: "",
      rate: ""
    }))
  });

  // Calculator State
  const [calcTitle, setCalcTitle] = useState("");
  const [calcItems, setCalcItems] = useState<CalcItem[]>(
    Array.from({ length: 10 }, (_, i) => ({
      id: `calc-${i}`,
      label: "",
      formula: ""
    }))
  );

  const [activeField, setActiveField] = useState<ActiveField | null>({ index: 0, field: 'currency' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [history, setHistory] = useState<ReceiptData[]>([receiptData]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const saveToHistory = useCallback((newData: ReceiptData) => {
    const newHistory = history.slice(0, historyIdx + 1);
    newHistory.push(newData);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
  }, [history, historyIdx]);

  const updateReceipt = useCallback((newData: ReceiptData) => {
    setReceiptData(newData);
    saveToHistory(newData);
  }, [saveToHistory]);

  const handleUndo = useCallback(() => {
    if (viewMode === 'RECEIPT' && historyIdx > 0) {
      const prevIdx = historyIdx - 1;
      setHistoryIdx(prevIdx);
      setReceiptData(history[prevIdx]);
    }
  }, [history, historyIdx, viewMode]);

  const handleRedo = useCallback(() => {
    if (viewMode === 'RECEIPT' && historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      setReceiptData(history[nextIdx]);
    }
  }, [history, historyIdx, viewMode]);

  const handleFieldSelect = (index: number, field: any) => {
    setActiveField({ index, field });
  };

  const handleKeyPress = (key: string) => {
    if (!activeField) return;
    const { index, field } = activeField;

    if (viewMode === 'RECEIPT') {
      // Logic for Enter/Next: Right then Down
      if (key === 'next' || key === 'enter') {
        if (field === 'currency') {
          setActiveField({ index, field: 'amount' });
        } else if (field === 'amount') {
          setActiveField({ index, field: 'rate' });
        } else if (field === 'rate') {
          // Wrap to next row's currency, or back to top if at last row
          const nextIdx = index < receiptData.items.length - 1 ? index + 1 : 0;
          setActiveField({ index: nextIdx, field: 'currency' });
        }
        return;
      }

      // Logic for Prev: Left then Up
      if (key === 'prev') {
        if (field === 'rate') {
          setActiveField({ index, field: 'amount' });
        } else if (field === 'amount') {
          setActiveField({ index, field: 'currency' });
        } else if (field === 'currency') {
          const prevIdx = index > 0 ? index - 1 : receiptData.items.length - 1;
          setActiveField({ index: prevIdx, field: 'rate' });
        }
        return;
      }

      const newItems = [...receiptData.items];
      const target = { ...newItems[index] };

      if (field === 'currency') {
        if (key === 'backspace') target.currency = target.currency.slice(0, -1);
        else if (target.currency.length < 3) target.currency = (target.currency + key).toUpperCase();
      } else {
        let currentVal = target[field as 'amount' | 'rate'];
        if (key === 'backspace') currentVal = currentVal.slice(0, -1);
        else if (key === '00') {
          if (currentVal.includes('.')) {
            const parts = currentVal.split('.');
            if (parts[1].length === 0) currentVal += '00';
            else if (parts[1].length === 1) currentVal += '0';
          } else currentVal += '00';
        } else if (key === '.') {
          if (!currentVal.includes('.')) currentVal = currentVal === "" ? "0." : currentVal + ".";
        } else if (!isNaN(parseInt(key))) {
          if (currentVal.includes('.')) {
            const parts = currentVal.split('.');
            if (parts[1].length < 2) currentVal += key;
          } else currentVal += key;
        } else return;
        target[field as 'amount' | 'rate'] = currentVal;
      }
      newItems[index] = target;
      updateReceipt({ ...receiptData, items: newItems });
    } else {
      // CALCULATOR MODE logic
      if (key === 'next') {
        if (field === 'title') setActiveField({ index: 0, field: 'label' });
        else if (field === 'label') setActiveField({ index, field: 'formula' });
        else if (index < calcItems.length - 1) setActiveField({ index: index + 1, field: 'label' });
        return;
      }
      if (key === 'prev') {
        if (field === 'formula') setActiveField({ index, field: 'label' });
        else if (index > 0) setActiveField({ index: index - 1, field: 'formula' });
        else if (field === 'label' && index === 0) setActiveField({ index: 0, field: 'title' });
        return;
      }
      if (key === 'enter') {
        if (field === 'title') {
          setActiveField({ index: 0, field: 'formula' });
        } else if (index < calcItems.length - 1) {
          setActiveField({ index: index + 1, field: field });
        }
        return;
      }

      if (field === 'title') {
        if (key === 'backspace') setCalcTitle(prev => prev.slice(0, -1));
        else setCalcTitle(prev => (prev + key).toUpperCase());
        return;
      }

      const newItems = [...calcItems];
      const target = { ...newItems[index] };

      if (field === 'label') {
        if (key === 'backspace') target.label = target.label.slice(0, -1);
        else if (!['+', '-', '*', '/'].includes(key)) target.label += key.toUpperCase();
      } else {
        if (key === 'backspace') target.formula = target.formula.slice(0, -1);
        else target.formula += key;
      }
      newItems[index] = target;
      setCalcItems(newItems);
    }
  };

  const handleClear = () => {
    if (viewMode === 'RECEIPT') {
      const resetData: ReceiptData = {
        ...receiptData,
        customerName: "",
        customerAddress: "",
        date: getDeviceDate(),
        items: Array.from({ length: 7 }, (_, i) => ({
          id: `item-${i}`,
          currency: "",
          amount: "",
          rate: ""
        }))
      };
      updateReceipt(resetData);
      setActiveField({ index: 0, field: 'currency' });
      setMessage("Receipt Cleared");
    } else {
      setCalcTitle("");
      setCalcItems(Array.from({ length: 10 }, (_, i) => ({
        id: `calc-${i}`,
        label: "",
        formula: ""
      })));
      setActiveField({ index: 0, field: 'title' });
      setMessage("Calculator Cleared");
    }
    setTimeout(() => setMessage(null), 1500);
  };

  const handleShare = async () => {
    const selector = viewMode === 'RECEIPT' ? 'receipt-capture' : 'calculator-capture';
    const node = document.getElementById(selector);
    if (!node) return;
    
    const currentActive = activeField;
    setActiveField(null);
    setLoading(true);
    setMessage("Generating Image...");

    await new Promise(r => setTimeout(r, 100));

    try {
      const blob = await htmlToImage.toBlob(node, {
        pixelRatio: 3,
        backgroundColor: viewMode === 'RECEIPT' ? (receiptData.type === 'SELL' ? '#fdf9c4' : '#bae6fd') : '#121212'
      });
      
      if (blob && navigator.share) {
        const file = new File([blob], `moneychanger_${Date.now().toString().slice(-4)}.png`, { type: 'image/png' });
        await navigator.share({ title: 'Money Changer Pro', files: [file] });
      } else if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setMessage("Copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed", err);
      setMessage("Process failed.");
    } finally {
      setActiveField(currentActive);
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-gray-950 shadow-2xl relative overflow-hidden">
      <div className="bg-black py-1 px-4 flex justify-between items-center border-b border-cyan-900/30 flex-shrink-0 z-50">
        <span className="text-cyan-400 font-black oswald text-[10px] tracking-widest uppercase">
          {viewMode === 'RECEIPT' ? 'Digital Receipt Pro' : 'Note Calculator'}
        </span>
        <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[9px] text-cyan-700 font-bold uppercase">System Active</span>
        </div>
      </div>

      <div className="flex-grow flex flex-col p-2 bg-gray-900 overflow-hidden relative">
        <div className="w-full h-full flex flex-col justify-center">
          {viewMode === 'RECEIPT' ? (
            <Receipt 
              data={receiptData} 
              activeField={activeField} 
              onFieldSelect={handleFieldSelect}
              onTextChange={(f, v) => updateReceipt({ ...receiptData, [f]: v })}
              onItemChange={(idx, f, v) => {
                const newItems = [...receiptData.items];
                newItems[idx][f] = v;
                updateReceipt({ ...receiptData, items: newItems });
              }}
              onTypeToggle={() => updateReceipt({ ...receiptData, type: receiptData.type === 'SELL' ? 'BUY' : 'SELL' })}
            />
          ) : (
            <CalculatorNote 
              title={calcTitle}
              items={calcItems}
              activeField={activeField}
              onFieldSelect={handleFieldSelect}
              onTextChange={(idx, f, v) => {
                if (f === 'title') {
                  setCalcTitle(v);
                } else {
                  const newItems = [...calcItems];
                  newItems[idx][f] = v;
                  setCalcItems(newItems);
                }
              }}
            />
          )}
        </div>
      </div>

      {message && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[60] px-6 py-2 rounded-full bg-cyan-500 text-black text-xs font-black oswald shadow-2xl uppercase tracking-wider animate-in fade-in slide-in-from-top-2">
          {message}
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-[3px] border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-cyan-400 font-black oswald animate-pulse uppercase tracking-widest text-sm">Processing</p>
          </div>
        </div>
      )}

      <div className="flex-shrink-0 z-50">
        <Keypad 
          onKeyPress={handleKeyPress}
          onClear={handleClear}
          onModeToggle={() => {
            const nextMode = viewMode === 'RECEIPT' ? 'CALCULATOR' : 'RECEIPT';
            setViewMode(nextMode);
            setActiveField({ index: 0, field: nextMode === 'RECEIPT' ? 'currency' : 'title' });
          }}
          onShare={handleShare}
          onUndo={handleUndo}
          onRedo={handleRedo}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};

export default App;
