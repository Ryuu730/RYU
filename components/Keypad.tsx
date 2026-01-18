
import React from 'react';
import { 
  Delete, 
  ArrowLeft, 
  ArrowRight, 
  CornerDownLeft, 
  Plus, 
  Minus, 
  X, 
  Divide,
  Trash2,
  FileText,
  Calculator,
  Share2,
  Undo2,
  Redo2
} from 'lucide-react';
import { ViewMode } from '../types';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onClear: () => void;
  onModeToggle: () => void;
  onShare: () => void;
  onUndo: () => void;
  onRedo: () => void;
  viewMode: ViewMode;
}

const Keypad: React.FC<KeypadProps> = ({ onKeyPress, onClear, onModeToggle, onShare, onUndo, onRedo, viewMode }) => {
  const keys = [
    { label: '7', value: '7' }, { label: '8', value: '8' }, { label: '9', value: '9' }, { label: <Delete className="w-8 h-8 text-cyan-400" />, value: 'backspace', type: 'special' }, { label: <CornerDownLeft className="w-8 h-8 text-cyan-400" />, value: 'enter', type: 'special' },
    { label: '4', value: '4' }, { label: '5', value: '5' }, { label: '6', value: '6' }, { label: <X className="w-8 h-8 text-cyan-400" />, value: '*', type: 'special' }, { label: <Divide className="w-8 h-8 text-cyan-400" />, value: '/', type: 'special' },
    { label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }, { label: <Plus className="w-8 h-8 text-cyan-400" />, value: '+', type: 'special' }, { label: <Minus className="w-8 h-8 text-cyan-400" />, value: '-', type: 'special' },
    { label: '0', value: '0' }, { label: '00', value: '00' }, { label: '.', value: '.' }, { label: <ArrowLeft className="w-8 h-8 text-cyan-400" />, value: 'prev', type: 'special' }, { label: <ArrowRight className="w-8 h-8 text-cyan-400" />, value: 'next', type: 'special' },
  ];

  return (
    <div className="bg-[#121212] w-full max-w-lg mx-auto p-2">
      {/* Top Action Buttons */}
      <div className="grid grid-cols-5 gap-1.5 mb-2">
        <button onClick={onClear} title="Clear All" className="bg-red-500/20 hover:bg-red-500/30 text-red-500 py-3 flex flex-col items-center justify-center rounded-sm transition-colors border border-red-500/30">
          <Trash2 className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-black oswald">CLEAR</span>
        </button>
        <button onClick={onUndo} title="Undo" className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 py-3 flex flex-col items-center justify-center rounded-sm transition-colors border border-orange-500/30">
          <Undo2 className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-black oswald">UNDO</span>
        </button>
        <button onClick={onRedo} title="Redo" className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 py-3 flex flex-col items-center justify-center rounded-sm transition-colors border border-orange-500/30">
          <Redo2 className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-black oswald">REDO</span>
        </button>
        <button onClick={onModeToggle} title={viewMode === 'RECEIPT' ? "Calculator Mode" : "Receipt Mode"} className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 py-3 flex flex-col items-center justify-center rounded-sm transition-colors border border-cyan-500/30">
          {viewMode === 'RECEIPT' ? <Calculator className="w-5 h-5 mb-0.5" /> : <FileText className="w-5 h-5 mb-0.5" />}
          <span className="text-[9px] font-black oswald uppercase">{viewMode === 'RECEIPT' ? 'CALC' : 'RECEIPT'}</span>
        </button>
        <button onClick={onShare} title="Share Image" className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 py-3 flex flex-col items-center justify-center rounded-sm transition-colors border border-cyan-500/30">
          <Share2 className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-black oswald uppercase">SHARE</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-5 gap-[1px] bg-cyan-900/40 border border-cyan-900/60">
        {keys.map((key, idx) => (
          <button
            key={idx}
            onClick={() => onKeyPress(key.value as string)}
            className="h-14 flex items-center justify-center text-3xl font-black text-cyan-100 hover:bg-cyan-900/30 active:bg-cyan-500/40 transition-colors oswald border border-cyan-900/20"
          >
            {key.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Keypad;
