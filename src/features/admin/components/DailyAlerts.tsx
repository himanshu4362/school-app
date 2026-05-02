import React from 'react';
import { AlertCircle, UserMinus, FileText, BellRing } from 'lucide-react';

const DailyAlerts: React.FC = () => {
  const alerts = [
    {
      id: 1,
      title: "Staff on Leave",
      value: "4 Teachers",
      description: "Requires substitute allocation.",
      icon: <UserMinus size={20} className="text-orange-600" />,
      bg: "bg-orange-50",
    },
    {
      id: 2,
      title: "Pending Admissions",
      value: "12 Inquiries",
      description: "Awaiting follow-up calls.",
      icon: <FileText size={20} className="text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      id: 3,
      title: "Low Attendance",
      value: "Class 10-B",
      description: "Below 75% threshold today.",
      icon: <AlertCircle size={20} className="text-red-600" />,
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-6">
        <BellRing size={20} className="text-slate-800" />
        <h2 className="text-lg font-bold text-slate-800">Today's Action Items</h2>
      </div>
      
      <div className="flex flex-col gap-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-4 p-3 rounded-lg border border-slate-50 hover:bg-slate-50 transition-colors">
            <div className={`p-3 rounded-lg ${alert.bg} shrink-0`}>
              {alert.icon}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">{alert.title}: <span className="text-slate-600 font-bold">{alert.value}</span></h4>
              <p className="text-xs text-slate-500 mt-1">{alert.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyAlerts;