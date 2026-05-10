import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { BookPlus, Save, Search, BookText } from 'lucide-react';
import { addMasterTitle } from '../../../../store/slices/librarySlice';
import { MasterTitle } from '../../../../../src/types/library/library.schema';

interface Props {
  titles: Record<string, MasterTitle>;
}

export const CatalogManager: React.FC<Props> = ({ titles }) => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  
  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Science');
  const [isbn, setIsbn] = useState('');
  const [edition, setEdition] = useState('');

  
const [thumbnailUrl, setThumbnailUrl] = useState('');
  const handleSaveTitle = () => {
    if (!title || !author) return;
    
    const newTitle: MasterTitle = {
      id: crypto.randomUUID(),
      title,
      author,
      category,
      isbn,
      edition,
      resourceType: 'PHYSICAL_BOOK',
      tags: [],
      thumbnailUrl: thumbnailUrl || 'https://w7.pngwing.com/pngs/242/154/png-transparent-hardcover-book-cover-paperback-book-template-picture-book-3-d-thumbnail.png',
    };
    
    dispatch(addMasterTitle(newTitle));
    setTitle(''); setAuthor(''); setIsbn(''); setEdition('');
  };

  const titleList = Object.values(titles).filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
      {/* ADD TITLE FORM */}
      <div className="lg:col-span-1 bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
          <BookPlus size={16} className="text-indigo-600"/> Add to Master Catalog
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Book Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Concepts of Physics" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"/>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Author(s)</label>
            <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="e.g. H.C. Verma" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none">
                <option value="Science">Science</option><option value="Mathematics">Mathematics</option><option value="Literature">Literature</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Edition</label>
              <input type="text" value={edition} onChange={e => setEdition(e.target.value)} placeholder="e.g. 2024" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none"/>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">ISBN (Optional)</label>
            <input type="text" value={isbn} onChange={e => setIsbn(e.target.value)} placeholder="e.g. 978-8177091878" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"/>
          </div>
          <button onClick={handleSaveTitle} disabled={!title || !author} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2 mt-2 shadow-md">
             <Save size={16}/> Save Master Title
          </button>
        </div>
      </div>

      {/* CATALOG LIST */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Master Catalog Registry</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2 text-slate-400" size={14} />
            <input type="text" placeholder="Search catalog..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none w-64"/>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar h-[400px]">
          {titleList.length === 0 ? (
            <p className="text-center text-xs font-bold text-slate-400 mt-10">No titles found in catalog.</p>
          ) : (
            titleList.map(t => (
              <div key={t.id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 flex justify-between items-center transition-colors">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0"><BookText size={20}/></div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{t.title}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Author: {t.author} • {t.category} {t.edition ? `• Ed: ${t.edition}` : ''}</p>
                  </div>
                </div>
                <img src={t.thumbnailUrl} className="w-10 h-14 object-cover rounded shadow-sm" />
                <div className="text-right">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-widest">{t.resourceType.replace('_', ' ')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogManager;