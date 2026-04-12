// src/components/MarketingStrip.tsx
import { DollarSign, Clock } from 'lucide-react';

export function MarketingStrip() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">

        <div className="group relative bg-gray-50 hover:bg-blue-900 rounded-[35px] p-8 border-2 border-gray-100 hover:border-blue-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-default">
          <span className="absolute top-6 right-8 text-6xl font-black text-gray-100 group-hover:text-blue-800 italic leading-none select-none transition-colors duration-300 pointer-events-none">03</span>
          <div className="relative z-10 mb-8">
            <div className="bg-white group-hover:bg-blue-800 w-14 h-14 rounded-[18px] flex items-center justify-center shadow-sm transition-all duration-300 border-2 border-gray-100 group-hover:border-blue-700">
              <DollarSign className="w-7 h-7 text-blue-400 group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
            </div>
          </div>
          <h3 className="font-black text-blue-900 group-hover:text-white uppercase italic text-xl mb-3 transition-colors duration-300 leading-tight">
            Preços Transparentes
          </h3>
          <p className="text-gray-400 group-hover:text-blue-200 font-bold text-sm leading-relaxed transition-colors duration-300">
            Veja o valor exato antes de confirmar sua reserva. Sem taxas ocultas.
          </p>
          <div className="mt-8 h-[3px] bg-gray-200 group-hover:bg-white rounded-full w-8 group-hover:w-full transition-all duration-500 ease-out" />
        </div>

        <div className="group relative bg-gray-50 hover:bg-blue-900 rounded-[35px] p-8 border-2 border-gray-100 hover:border-blue-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-default">
          <span className="absolute top-6 right-8 text-6xl font-black text-gray-100 group-hover:text-blue-800 italic leading-none select-none transition-colors duration-300 pointer-events-none">04</span>
          <div className="relative z-10 mb-8">
            <div className="bg-white group-hover:bg-blue-800 w-14 h-14 rounded-[18px] flex items-center justify-center shadow-sm transition-all duration-300 border-2 border-gray-100 group-hover:border-blue-700">
              <Clock className="w-7 h-7 text-amber-400 group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
            </div>
          </div>
          <h3 className="font-black text-blue-900 group-hover:text-white uppercase italic text-xl mb-3 transition-colors duration-300 leading-tight">
            Reserva Instantânea
          </h3>
          <p className="text-gray-400 group-hover:text-blue-200 font-bold text-sm leading-relaxed transition-colors duration-300">
            Escolha data e horário em poucos cliques. Confirmação imediata via WhatsApp.
          </p>
          <div className="mt-8 h-[3px] bg-gray-200 group-hover:bg-white rounded-full w-8 group-hover:w-full transition-all duration-500 ease-out" />
        </div>

      </div>
    </section>
  );
}