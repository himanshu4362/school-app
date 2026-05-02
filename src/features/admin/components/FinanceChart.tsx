import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { month: 'Jan', feesCollected: 4200000, salaryDisbursed: 1800000 },
  { month: 'Feb', feesCollected: 3800000, salaryDisbursed: 1800000 },
  { month: 'Mar', feesCollected: 4520000, salaryDisbursed: 1850000 }, // Current month matching MVP
];

// Helper to format large numbers to "Lakhs" (L)
const formatToLakhs = (value: number) => `₹${(value / 100000).toFixed(1)}L`;

const FinanceChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col h-96">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">Financial Overview</h2>
        <p className="text-sm text-slate-500">Fees Submitted vs Staff Salary</p>
      </div>

      <div className="flex-1 w-full h-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barSize={32} >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
            <YAxis tickFormatter={formatToLakhs} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip 
              formatter={(value: number) => [`₹${(value).toLocaleString('en-IN')}`, undefined]}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Bar dataKey="feesCollected" name="Fees Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="salaryDisbursed" name="Salary Disbursed" fill="#e11d48" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinanceChart;