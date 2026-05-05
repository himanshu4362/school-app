import React from 'react';
import { Link } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import SchoolLogo from '../../../assets/school logo.jpg';
import Footer from '../../../components/Footer';
import { BookOpen, Calendar, Users, Trophy } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Home: React.FC = () => {
  const images = [
    "https://images.unsplash.com/photo-1728206348193-9b5ae74a7d32?q=80&w=1469&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1592066575517-58df903152f2?q=80&w=1598&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=1469&auto=format&fit=crop"
  ];

  const quickStats = [
    { icon: <Users size={32} />, title: "2500+", desc: "Students Enrolled" },
    { icon: <BookOpen size={32} />, title: "150+", desc: "Expert Faculty" },
    { icon: <Trophy size={32} />, title: "50+", desc: "Awards Won" },
    { icon: <Calendar size={32} />, title: "25+", desc: "Years of Excellence" },
  ];

  return (
    <IonPage>
      <IonContent>
        <div className="flex flex-col min-h-screen">
          
          {/* Header Section */}
          <div className='flex flex-col md:flex-row justify-between items-center px-6 py-6 gap-4 bg-white'>
            <div className='flex items-center gap-4'>
              <img className='h-14 w-14 rounded-full shadow-sm' src={SchoolLogo} alt="school logo" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Delhi Public School</h1>
                <h3 className="text-sm text-slate-500 font-medium tracking-wide">RANCHI</h3>
              </div>
            </div>
            
            <nav className='flex flex-wrap gap-6 text-slate-600 font-semibold text-sm'>
              <Link className="hover:text-blue-600 transition" to='/'>Home</Link>
              <Link className="hover:text-blue-600 transition" to='/about'>About</Link>
              <Link className="hover:text-blue-600 transition" to='/academics'>Academics</Link>
              <Link className="hover:text-blue-600 transition" to='/event'>Events</Link>
              <Link className="hover:text-blue-600 transition" to='/gallery'>Gallery</Link>
              <Link className="text-blue-600 hover:text-blue-800 transition" to='/auth'>Portal Login</Link>
            </nav>
          </div>

          {/* Swiper Carousel Section */}
          <div className='w-full h-[400px] md:h-[550px] relative px-4 mb-12'>
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={30}
              slidesPerView={1}
              loop={true}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              navigation={true}
              className="w-full h-full rounded-2xl shadow-xl overflow-hidden"
            >
              {images.map((src, idx) => (
                <SwiperSlide key={idx}>
                  <img className='w-full h-full object-cover' src={src} alt={`slide-${idx}`} />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center md:items-end">
                    <h2 className="text-white text-3xl md:text-5xl font-bold drop-shadow-lg text-center px-4 md:mb-10">
                      {idx === 0 && "Welcome to Excellence"}
                      {idx === 1 && "Shaping Future Leaders"}
                      {idx === 2 && "State of the Art Campus"}
                    </h2>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Quick Stats / Info Section */}
          <div className="max-w-7xl mx-auto px-6 mb-16 w-full">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Why Choose DPS Ranchi?</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Providing a nurturing environment where students can discover their potential and achieve their highest aspirations.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, idx) => (
                <div key={idx} className="bg-blue-50 rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition">
                  <div className="bg-blue-600 text-white p-4 rounded-full mb-4">
                    {stat.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">{stat.title}</h3>
                  <p className="text-slate-600 font-medium">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Spacer to push footer to bottom if content is short */}
          <div className="flex-grow"></div>

          {/* Global Footer */}
          <Footer />

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;