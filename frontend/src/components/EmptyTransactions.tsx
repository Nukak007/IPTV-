import React from 'react';
import { PlusCircle, Receipt, Sparkles, FolderSync } from 'lucide-react';

interface EmptyTransactionsProps {
  onAddTransaction: () => void;
  onLoadSampleData?: () => void;
}

export const EmptyTransactions: React.FC<EmptyTransactionsProps> = ({
  onAddTransaction,
  onLoadSampleData,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center shadow-xs">
      <div className="max-w-md mx-auto flex flex-col items-center">
        {/* Decorative Icon Graphic */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
            <Receipt className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Text descriptions */}
        <h4 className="text-xl font-bold text-slate-800 tracking-tight">
          Aún no tienes transacciones registradas
        </h4>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Tu balance y tus categorías financieras cobrarán vida cuando agregues tus primeros ingresos o egresos. Registra tu primer movimiento ahora para comenzar el control de tu presupuesto.
        </p>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <button
            onClick={onAddTransaction}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm hover:shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar mi primer movimiento</span>
          </button>

          {onLoadSampleData && (
            <button
              onClick={onLoadSampleData}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors cursor-pointer border border-slate-200"
            >
              <FolderSync className="w-4 h-4 text-slate-500" />
              <span>Cargar transacciones de prueba</span>
            </button>
          )}
        </div>

        {/* Mini Feature hints */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10 pt-8 border-t border-slate-100 w-full text-left">
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Categorías
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Organiza automáticamente tus gastos por rubro.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Historial 100% claro
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Filtra por fechas, importes o tipos de movimiento.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Balance dinámico
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Visualiza tu ahorro neto al instante.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
