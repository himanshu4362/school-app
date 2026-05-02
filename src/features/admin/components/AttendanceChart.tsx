import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { week: 'Week 1', students: 4100, teachers: 138, totalStudents: 5000 },
  { week: 'Week 2', students: 3950, teachers: 140, totalStudents: 5000 },
  { week: 'Week 3', students: 4050, teachers: 135, totalStudents: 5000 },
  { week: 'Week 4', students: 4022, teachers: 142, totalStudents: 5000 },
];

const AttendanceChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col h-96">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">Monthly Presence Trend</h2>
        <p className="text-sm text-slate-500">Avg. 4,022 / 5,000 Students Present</p>
      </div>
      
      <div className="flex-1 w-full h-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Area type="monotone" dataKey="students" name="Students Present" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceChart;