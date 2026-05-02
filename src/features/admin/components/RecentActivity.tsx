import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

const RecentActivity: React.FC = () => {
  const activities = [
    { id: 1, text: "Fee payment of ₹45,000 received for Amit Kumar (Class 8-A)", time: "10 mins ago", type: "success" },
    { id: 2, text: "Term 1 Examination Schedule published by Admin", time: "2 hours ago", type: "info" },
    { id: 3, text: "Transport: Bus Route 4 delayed by 15 mins", time: "3 hours ago", type: "warning" },
    { id: 4, text: "Leave request approved for Mrs. Sharma (Science)", time: "5 hours ago", type: "success" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
        <button className="text-sm text-blue-600 hover:underline">View All</button>
      </div>

      <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="relative pl-6">
            {/* Timeline Dot */}
            <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white ${
              activity.type === 'success' ? 'bg-green-500' : 
              activity.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
            }`}></span>
            
            <p className="text-sm text-slate-700">{activity.text}</p>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
              <Clock size={12} />
              <span>{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;