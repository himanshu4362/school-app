import React from 'react';
import StatCard from './StatCard';
import { Users, GraduationCap, Banknote, IndianRupee } from 'lucide-react';

const DashboardStats: React.FC = () => {
  // In a real app, this data would be fetched via API
  const stats = [
    {
      title: "Total Students",
      value: "2,543",
      icon: <Users size={24} className="text-blue-600" />,
      colorClass: "bg-blue-50",
      trend: { value: "12%", isPositive: true }
    },
    {
      title: "Total Teachers",
      value: "142",
      icon: <GraduationCap size={24} className="text-purple-600" />,
      colorClass: "bg-purple-50",
      trend: { value: "3%", isPositive: true }
    },
    {
      title: "Fee Collection (This Month)",
      value: "₹ 45.2L",
      icon: <IndianRupee size={24} className="text-emerald-600" />,
      colorClass: "bg-emerald-50",
      trend: { value: "8%", isPositive: true }
    },
    {
      title: "Salary Disbursed",
      value: "₹ 18.5L",
      icon: <Banknote size={24} className="text-rose-600" />,
      colorClass: "bg-rose-50",
      trend: { value: "1.2%", isPositive: false }
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;