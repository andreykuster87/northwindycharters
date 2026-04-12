// src/components/CreateTripModal/shared/OptionChip.tsx
export function OptionChip({ label, icon, active, onClick }: {
  label:   string;
  icon:    string;
  active:  boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-[16px] border-2 font-black text-xs uppercase italic transition-all
        ${active
          ? 'bg-blue-900 text-white border-blue-900 shadow-md'
          : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-blue-300 hover:text-blue-900'
        }`}>
      <span className="text-base">{icon}</span>{label}
    </button>
  );
}