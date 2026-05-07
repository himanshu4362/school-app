import React from 'react';
import { useHistory } from 'react-router-dom';
import { 
  IonCard, IonCardContent, IonButton, IonIcon, IonProgressBar, IonBadge 
} from '@ionic/react';
import { 
  BookOpen, CheckCircle2, ChevronRight, BarChart3, Layers, Clock 
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import AdminLayout from "../../components/AdminLayout";
import 'swiper/css';
import 'swiper/css/pagination';

const SyllabusManager: React.FC = () => {
  const history = useHistory();

  // Mock data for Carousel
  const completionStats = [
    { class: "Grade 10-A", progress: 0.75, highlight: "Science nearly complete", color: "blue" },
    { class: "Grade 12-Sci", progress: 0.40, highlight: "Math lagging behind", color: "rose" },
    { class: "Grade 9-B", progress: 0.90, highlight: "On track for finals", color: "emerald" },
  ];

  // Mock data for Class Cards
  const classes = [
    { id: 'C10', name: 'Class 10', subjects: 6, chapters: 42, sessions: 120 },
    { id: 'C11', name: 'Class 11', subjects: 5, chapters: 38, sessions: 110 },
    { id: 'C12', name: 'Class 12', subjects: 5, chapters: 45, sessions: 130 },
  ];

  return (
    <AdminLayout pageTitle="Syllabus Management" pageDescription="Monitor and modify academic progress across all departments.">
      
      {/* SECTION 1: Completion Carousel */}
      <div className="mb-10">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Completion Insights</h3>
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          className="pb-10"
        >
          {completionStats.map((stat, i) => (
            <SwiperSlide key={i}>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm ring-1 ring-slate-900/5 h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                    <BarChart3 size={24} />
                  </div>
                  <IonBadge color={stat.color === 'emerald' ? 'success' : stat.color === 'rose' ? 'danger' : 'primary'}>
                    {(stat.progress * 100).toFixed(0)}% Done
                  </IonBadge>
                </div>
                <h4 className="text-xl font-black text-slate-900">{stat.class}</h4>
                <p className="text-sm text-slate-500 font-medium mb-6">{stat.highlight}</p>
                
                <div className="space-y-2">
                  <IonProgressBar value={stat.progress} color={stat.color === 'rose' ? 'danger' : 'primary'} className="h-2 rounded-full" />
                  <button 
                    onClick={() => history.push(`/admin/academic/syllabus/detail?class=${stat.class}`)}
                    className="text-xs font-black text-blue-600 uppercase flex items-center gap-1 hover:underline mt-4"
                  >
                    Show Full Details <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* SECTION 2: Modification & Management Grid */}
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Modify Syllabus by Class</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div 
            key={cls.id}
            onClick={() => history.push(`/admin/academic/syllabus/manage/${cls.id}`)}
            className="group bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer ring-1 ring-slate-900/5"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">
                {cls.id}
              </div>
              <div className="p-2 bg-slate-50 text-slate-400 group-hover:text-blue-600 rounded-xl transition-colors">
                <Layers size={20} />
              </div>
            </div>
            
            <h4 className="text-2xl font-black text-slate-900 mb-2">{cls.name}</h4>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700">{cls.subjects} Subjects</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700">{cls.chapters} Chapters</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <Clock size={16} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700">{cls.sessions} Total Expected Sessions</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default SyllabusManager;



{/* <div>
          <Swiper slidesPerView={3} spaceBetween={20} loop centeredSlides modules={[Pagination, Autoplay]} pagination={{ clickable: true }} autoplay={{ delay: 3000 }}
            breakpoints={{
              200: { slidesPerView: 1 },
              550: { slidesPerView: 2 },
              1000: { slidesPerView: 3 }
            }}
          >
            {SliderArr.map((value, index) => {
              return (
                <SwiperSlide key={index} >
                  <div className="shadow-2xl bg-slate-400">{value}</div>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </div> */}