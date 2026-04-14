// src/components/shared/BirthDatePicker.tsx
import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { applyDateMask } from '../../utils/sailorHelpers';

export function BirthDatePicker({ day, month, year, onDay, onMonth, onYear }: {
  day: string; month: string; year: string;
  onDay: (v: string) => void; onMonth: (v: string) => void; onYear: (v: string) => void;
}) {
  // Guarda o valor bruto digitado pelo usuário
  const [rawValue, setRawValue] = useState(() => {
    if (!day && !month && !year) return '';
    return applyDateMask([day, month, year].join(''));
  });

  const handleChange = (raw: string) => {
    const masked = applyDateMask(raw);
    setRawValue(masked);
    const digits = masked.replace(/\D/g, '');
    onDay(digits.substring(0, 2));
    onMonth(digits.substring(2, 4));
    onYear(digits.substring(4, 8));
  };

  return (
    <div>
      <label className="text-[10px] font-bold text-[#1a2b4a] uppercase tracking-wider ml-1 mb-1.5 flex items-center gap-1.5">
        <Calendar className="w-3 h-3" /> Data de Nascimento *
      </label>
      <input
        type="text"
        inputMode="numeric"
        value={rawValue}
        onChange={e => handleChange(e.target.value)}
        placeholder="dd/mm/aaaa"
        maxLength={10}
        className="w-full bg-white border-2 border-gray-100 py-3 px-4 font-bold text-[#1a2b4a] outline-none text-sm focus:border-[#c9a96e] transition-all"
      />
    </div>
  );
}
