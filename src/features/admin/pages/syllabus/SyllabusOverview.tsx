import React from 'react';
import { useHistory } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Swiper Styles (Must be imported for it to work correctly)
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import AdminLayout from '../../components/layout/AdminLayout';
import { BookOpen, Layers, Clock, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';

const SyllabusOverview: React.FC = () => {
  const history = useHistory();

  // --- MOCK DATA: Analytics for the Hero Carousel ---
  const completionStats = [
    { 
      id: 'C10', name: 'Class 10', progress: 78, 
      highlight: 'Science & Math are ahead of schedule.', 
      status: 'On Track', color: 'emerald' 
    },
    { 
      id: 'C12', name: 'Class 12 - Science', progress: 42, 
      highlight: 'Physics curriculum is lagging by 2 weeks.', 
      status: 'At Risk', color: 'rose' 
    },
    { 
      id: 'C9', name: 'Class 9', progress: 85, 
      highlight: 'Term 1 syllabus successfully completed.', 
      status: 'Excellent', color: 'blue' 
    },
  ];

  // --- MOCK DATA: Classes for the Management Grid ---
  const classes = [
    { id: 'C10', name: 'Class 10', subjects: 6, chapters: 42, sessions: 120 },
    { id: 'C11', name: 'Class 11', subjects: 5, chapters: 38, sessions: 110 },
    { id: 'C12', name: 'Class 12', subjects: 5, chapters: 45, sessions: 130 },
  ];

  return (
    <AdminLayout 
      pageTitle="Academic Hub" 
      pageDescription="Monitor curriculum progress and manage subject definitions."
      breadcrumbs={[
        { label: 'Academic Hub' }, 
        { label: 'Syllabus' }
      ]}
    >
      
      {/* ========================================================= */}
      {/* SECTION 1: HERO CAROUSEL (Completion Status)              */}
      {/* ========================================================= */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Live Completion Status</h3>
          <button 
            onClick={() => history.push('/admin/academic/syllabus/analytics')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
          >
            Show All Analytics <ChevronRight size={14}/>
          </button>
        </div>

        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          spaceBetween={20}
          slidesPerView={1}
          pagination={{ clickable: true, dynamicBullets: true }}
          autoplay={{ delay: 5000, disableOnInteraction: true }}
          className="rounded-[2.5rem] shadow-sm ring-1 ring-slate-900/5 bg-white pb-12"
        >
          {completionStats.map((stat) => (
            <SwiperSlide key={stat.id}>
              <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
                
                {/* Left Side: Text Info */}
                <div className="flex-1 space-y-4 w-full text-center md:text-left">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest
                    ${stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-700' : 
                      stat.color === 'rose' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'}`}
                  >
                    {stat.color === 'rose' ? <AlertCircle size={14}/> : <TrendingUp size={14}/>}
                    {stat.status}
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                    {stat.name}
                  </h2>
                  <p className="text-slate-500 font-medium md:text-lg">
                    {stat.highlight}
                  </p>

                  <button 
                    onClick={() => history.push(`/admin/academic/syllabus/analytics/${stat.id}`)}
                    className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 inline-flex items-center gap-2"
                  >
                    View Class Details <ChevronRight size={16}/>
                  </button>
                </div>

                {/* Right Side: Circular Progress Indicator */}
                <div className="shrink-0 relative w-48 h-48 flex flex-col items-center justify-center">
                  {/* SVG Circle for Progress Ring */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" className="stroke-slate-100" strokeWidth="16" fill="none" />
                    <circle 
                      cx="96" cy="96" r="88" 
                      className={`transition-all duration-1000 ease-out ${
                        stat.color === 'emerald' ? 'stroke-emerald-500' : 
                        stat.color === 'rose' ? 'stroke-rose-500' : 'stroke-blue-500'
                      }`}
                      strokeWidth="16" fill="none" 
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${2 * Math.PI * 88 * (1 - stat.progress / 100)}`}
                    />
                  </svg>
                  <span className="text-4xl font-black text-slate-900 relative z-10">{stat.progress}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Completed</span>
                </div>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ========================================================= */}
      {/* SECTION 2: MANAGEMENT GRID (Click to Edit Syllabus)       */}
      {/* ========================================================= */}
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 pl-1">Modify Curriculum Definition</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div 
            key={cls.id}
            onClick={() => history.push(`/admin/academic/syllabus/manage/${cls.id}`)}
            className="group bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer ring-1 ring-slate-900/5"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shadow-md">
                {cls.id}
              </div>
              <div className="p-2 bg-slate-50 text-slate-400 group-hover:text-blue-600 rounded-xl transition-colors">
                <Layers size={20} />
              </div>
            </div>
            
            <h4 className="text-2xl font-black text-slate-900 mb-2">{cls.name}</h4>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 mt-4">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700">{cls.subjects} Subjects</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <Clock size={16} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700">{cls.sessions} Expected Sessions</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </AdminLayout>
  );
};

export default SyllabusOverview;