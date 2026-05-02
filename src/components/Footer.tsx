import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-10 mt-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* About Section */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Delhi Public School</h2>
          <p className="text-sm leading-relaxed mb-4">
            Empowering students to achieve excellence through holistic education, 
            innovative learning methodologies, and strong moral values.
          </p>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/" className="hover:text-blue-400 transition"><FaFacebook size={20} /></a>
            <a href="https://x.com/" className="hover:text-blue-400 transition"><FaTwitter size={20} /></a>
            <a href="https://www.instagram.com/" className="hover:text-blue-400 transition"><FaInstagram size={20} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
            <li><Link to="/academics" className="hover:text-white transition">Academics</Link></li>
            <li><Link to="/admissions" className="hover:text-white transition">Admissions</Link></li>
            <li><Link to="/gallery" className="hover:text-white transition">Gallery</Link></li>
            <li><Link to="/auth" className="hover:text-white transition">Student/Parent Portal</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-blue-400 shrink-0" />
              <span>DPS Campus, Sector 4, Ranchi, Jharkhand 834004</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-blue-400 shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-blue-400 shrink-0" />
              <span>info@dpsranchi.edu.in</span>
            </li>
          </ul>
        </div>

      </div>
      
      <div className="border-t border-slate-800 mt-8 pt-6 text-center text-xs">
        <p>&copy; {new Date().getFullYear()} Delhi Public School, Ranchi. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;