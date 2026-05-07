import React from 'react';
import { IonCard, IonCardContent } from '@ionic/react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorClass: string; // e.g., 'text-blue-600 bg-blue-50'
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, colorClass }) => {
  return (
    <IonCard className="m-0 shadow-sm border border-slate-100 rounded-2xl hover:shadow-md transition-shadow bg-white">
      <IonCardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${colorClass}`}>
            {icon}
          </div>
          {trend && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{title}</h3>
          <p className="text-3xl font-black text-slate-900">{value}</p>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default StatCard;