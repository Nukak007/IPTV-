import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { MetricCard } from '../components/MetricCard';
import { EmptyTransactions } from '../components/EmptyTransactions';
import { NewTransactionModal } from '../components/NewTransactionModal';
import type { Transaction } from '../types';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  RotateCcw,
  Calendar,
} from 'lucide-react';

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    description: 'Nómina mensual empresa',
    amount: 2850.00,
    type: 'income',
    category: 'Salario',
    date: '2026-09-01',
    status: 'completed',
  },
  {
    id: 'tx_2',
    description: 'Compra supermercado Carulla',
    amount: 142.50,
    type: 'expense',
    category: 'Alimentación',
    date: '2026-09-04',
    status: 'completed',
  },
  {
    id: 'tx_3',
    description: 'Internet Fibra Óptica',
    amount: 45.00,
    type: 'expense',
    category: 'Servicios',
    date: '2026-09-08',
    status: 'completed',
  },
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx_${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearTransactions = () => {
    setTransactions([]);
  };

  const handleLoadSamples = () => {
    setTransactions(SAMPLE_TRANSACTIONS);
  };

  // Filtered transactions for the list view
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Hola, {user?.name || 'Usuario'} <span className="inline-block animate-wave origin-bottom-right">👋</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Bienvenido a tu panel de Centavo. Aquí tienes el estado general de tus finanzas.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs hover:shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Transacción</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Balance Total"
            amount={formatCurrency(balance)}
            subtitle="Patrimonio líquido"
            icon={Wallet}
            iconBgColor="bg-emerald-50"
            iconColor="text-emerald-600"
            badgeText={transactions.length === 0 ? 'Sin movimientos' : 'Al día'}
            badgeType={transactions.length === 0 ? 'neutral' : 'success'}
          />
          <MetricCard
            title="Ingresos del Mes"
            amount={formatCurrency(totalIncome)}
            subtitle="Entradas acumuladas"
            icon={TrendingUp}
            iconBgColor="bg-teal-50"
            iconColor="text-teal-600"
            badgeText={totalIncome > 0 ? '+ En positivo' : '$0 inicial'}
            badgeType={totalIncome > 0 ? 'success' : 'neutral'}
          />
          <MetricCard
            title="Gastos del Mes"
            amount={formatCurrency(totalExpense)}
            subtitle="Salidas registradas"
            icon={TrendingDown}
            iconBgColor="bg-rose-50"
            iconColor="text-rose-600"
            badgeText={totalExpense > 0 ? 'En presupuesto' : 'Sin gastos'}
            badgeType={totalExpense > 0 ? 'warning' : 'neutral'}
          />
          <MetricCard
            title="Tasa de Ahorro"
            amount={`${savingsRate}%`}
            subtitle="Margen neto generado"
            icon={PiggyBank}
            iconBgColor="bg-indigo-50"
            iconColor="text-indigo-600"
            badgeText={savingsRate >= 15 ? 'Óptima (>15%)' : 'Calculando'}
            badgeType={savingsRate >= 15 ? 'success' : 'neutral'}
          />
        </section>

        {/* Transactions Section */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          {/* Header of Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">Listado de Transacciones</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  {transactions.length} {transactions.length === 1 ? 'registro' : 'registros'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Consulta, filtra y gestiona los ingresos y egresos de tu cuenta.
              </p>
            </div>

            {/* Controls: Search & Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por concepto o categoría..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
                />
              </div>

              {/* Type Filter Buttons */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterType === 'all'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilterType('income')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterType === 'income'
                      ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Ingresos
                </button>
                <button
                  onClick={() => setFilterType('expense')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterType === 'expense'
                      ? 'bg-white text-rose-700 shadow-xs font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Gastos
                </button>
              </div>

              {/* Reset to Empty State Button (for testing) */}
              {transactions.length > 0 && (
                <button
                  onClick={handleClearTransactions}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-xl border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                  title="Vaciar listado para ver el Empty State"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Vaciar a lista vacía</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Content Area: Empty State or Table */}
          {transactions.length === 0 ? (
            <EmptyTransactions
              onAddTransaction={() => setIsModalOpen(true)}
              onLoadSampleData={handleLoadSamples}
            />
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">No se encontraron movimientos con los filtros aplicados.</p>
              <button
                onClick={() => {
                  setFilterType('all');
                  setSearchQuery('');
                }}
                className="mt-2 text-xs text-emerald-600 font-medium hover:underline"
              >
                Limpiar filtros de búsqueda
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Fecha</th>
                    <th className="pb-3">Descripción</th>
                    <th className="pb-3">Categoría</th>
                    <th className="pb-3 text-right">Monto</th>
                    <th className="pb-3 text-center w-16">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-3.5 pl-2 text-xs text-slate-500 font-medium whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {tx.date}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-900 font-medium">
                        <div className="flex items-center gap-2">
                          <span
                            className={`p-1.5 rounded-lg shrink-0 ${
                              tx.type === 'income'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-rose-50 text-rose-600'
                            }`}
                          >
                            {tx.type === 'income' ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4" />
                            )}
                          </span>
                          <span className="truncate max-w-xs sm:max-w-sm">{tx.description}</span>
                        </div>
                      </td>
                      <td className="py-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-semibold whitespace-nowrap">
                        <span
                          className={
                            tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                          }
                        >
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Eliminar transacción"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 py-5 bg-white text-center text-xs text-slate-400">
        <p>Centavo © 2026 · Scaffold del Frontend Dashboard · Finanzas Personales</p>
      </footer>

      {/* Transaction Modal */}
      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </div>
  );
};
