import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Library, Search, Book, History, AlertCircle } from 'lucide-react';

const mockBooks = [
  { id: 'BK-409', title: 'Concepts of Physics', author: 'H.C. Verma', status: 'Issued', borrower: 'Aarav Patel (10-A)', dueDate: 'May 10, 2026' },
  { id: 'BK-221', title: 'Modern Biology', author: 'Trueman', status: 'Available', borrower: '-', dueDate: '-' },
  { id: 'BK-115', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', status: 'Overdue', borrower: 'Isha Sharma (10-A)', dueDate: 'Apr 28, 2026' },
];

const LibraryManager: React.FC = () => {
  return (
    <AdminLayout 
      pageTitle="Library Inventory" 
      pageDescription="Manage book circulation, cataloging, and late return penalties."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ring-1 ring-slate-900/5">
          <div className="p-4 bg-slate-50/50 border-b flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input placeholder="Search books by title, author, or ISBN..." className="w-full pl-10 pr-4 py-2 text-sm bg-transparent outline-none" />
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-2"><Book size={14}/> Add New Book</button>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-2"><History size={14}/> Issue History</button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50/50 text-slate-500 uppercase text-[10px] tracking-widest font-black">
              <tr>
                <th className="px-6 py-4 text-left">Book Details</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Current Borrower</th>
                <th className="px-6 py-4 text-left">Due Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {mockBooks.map(book => (
                <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-slate-900 font-bold">{book.title}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-mono">{book.author} • {book.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ring-1 ring-inset ${
                      book.status === 'Overdue' ? 'bg-rose-50 text-rose-700 ring-rose-600/20' : 
                      book.status === 'Issued' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' : 
                      'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                    }`}>{book.status}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 italic">{book.borrower}</td>
                  <td className="px-6 py-4">
                    {book.status === 'Overdue' ? (
                      <div className="flex items-center gap-1.5 text-rose-600 font-bold">
                        <AlertCircle size={14}/> {book.dueDate}
                      </div>
                    ) : <span className="text-slate-500">{book.dueDate}</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 font-bold text-xs hover:underline">Issue / Return</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
export default LibraryManager;