// src/components/CreateTripModal/shared/OptionChip.tsx
export function OptionChip({ label, icon, active, onClick }: {
  label:   string;
  icon:    string;
  active:  boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 border-2 font-bold text-xs uppercase italic transition-all
        ${active
          ? 'bg-[#0a1628] text-white border-[#0a1628] shadow-md'
          : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-[#c9a96e]/30 hover:text-[#1a2b4a]'
        }`}>
      <span className="text-base">{icon}</span>{label}
    </button>
  );
}
