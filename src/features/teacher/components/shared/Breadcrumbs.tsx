import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest overflow-x-auto whitespace-nowrap pb-2 custom-scrollbar">
      <Link to="/teacher" className="hover:text-blue-600 transition-colors flex items-center gap-1">
        <Home size={14} />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="text-slate-300" />
          {item.path ? (
            <Link to={item.path} className="hover:text-blue-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-800">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;