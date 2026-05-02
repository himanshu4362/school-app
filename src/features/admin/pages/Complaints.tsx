import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { MessageSquare, User, Tag, Calendar, ChevronRight } from 'lucide-react';

interface Complaint {
  id: string;
  title: string;
  from: string;
  role: 'Parent' | 'Teacher' | 'Staff';
  category: 'Academic' | 'Facilities' | 'Transport' | 'Other';
  date: string;
  priority: 'Urgent' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
}

const mockComplaints: Complaint[] = [
  { id: 'C-001', title: "Delayed feedback on Math assignments", from: "Rajesh Patel", role: "Parent", category: "Academic", date: "Oct 28, 2026", priority: "Medium", status: "Open" },
  { id: 'C-002', title: "Bus Route 4 AC not working", from: "Vikram Sharma", role: "Parent", category: "Transport", date: "Oct 27, 2026", priority: "Urgent", status: "In Progress" },
];

const Complaints: React.FC = () => {
  return (
    <AdminLayout 
      pageTitle="Complaints & Resolution" 
      pageDescription="Track and resolve issues raised by the school community."
    >
      <div className="grid grid-cols-1 gap-4">
        {mockComplaints.map(item => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-all cursor-pointer group shadow-sm">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    item.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.priority}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Tag size={12} /> {item.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><User size={16} /> {item.from} ({item.role})</span>
                  <span className="flex items-center gap-1.5"><Calendar size={16} /> {item.date}</span>
                </div>
              </div>

              <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  item.status === 'Open' ? 'bg-white text-rose-600 border-rose-200' : 'bg-blue-50 text-blue-700 border-blue-100'
                }`}>
                  {item.status}
                </span>
                <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Complaints;