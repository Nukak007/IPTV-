import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'neutral' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-emerald-50',
  iconColor = 'text-emerald-600',
  badgeText,
  badgeType = 'neutral',
}) => {
  const badgeStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/60',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
            {amount}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBgColor} ${iconColor} shadow-inner`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
        <span className="text-slate-500 truncate">{subtitle || 'Estado actualizado'}</span>
        {badgeText && (
          <span className={`px-2 py-0.5 rounded-full font-medium border text-[11px] ${badgeStyles[badgeType]}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};
