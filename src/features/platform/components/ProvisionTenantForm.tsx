import React, { useState } from 'react';
import { Building2, UserCircle, CreditCard, ShieldCheck } from 'lucide-react';
import { IonContent, IonPage } from '@ionic/react';

const ProvisionTenantForm: React.FC = () => {
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolCode: '',
    subscriptionPlan: 'PREMIUM_YEARLY',
    adminName: '',
    adminEmail: '',
    adminPhone: ''
  });

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      tenantData: {
        schoolName: formData.schoolName,
        schoolCode: formData.schoolCode.toUpperCase(),
        subscriptionPlan: formData.subscriptionPlan,
      },
      adminData: {
        fullName: formData.adminName,
        email: formData.adminEmail,
        phone: formData.adminPhone,
        role: 'SUPER_ADMIN'
      }
    };

    console.log("[FRONTEND] Sending to Backend API:");
    console.log(JSON.stringify(payload, null, 2));
    alert("Check your browser console for the JSON Payload!");
  };

  return (
    <IonPage>
      <IonContent>
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans">
          <div className="w-full max-w-3xl">

            {/* Header */}
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ShieldCheck size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Genesis</h1>
              <p className="text-slate-500 font-bold mt-2">Provision a new multi-tenant school instance.</p>
            </div>

            {/* The Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden">

              {/* SECTION 1: School Details */}
              <div className="p-8 border-b border-slate-100">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-6">
                  <Building2 size={16} className="text-blue-600" /> 1. Institution Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registered School Name</label>
                    <input required type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} placeholder="e.g. Delhi Public School, Ranchi" className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">School Code (Prefix)</label>
                    <input required type="text" name="schoolCode" value={formData.schoolCode} onChange={handleChange} placeholder="e.g. DPSR" className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors uppercase" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Admin Details */}
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-6">
                  <UserCircle size={16} className="text-blue-600" /> 2. Super Admin Credentials
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Principal / Director Name</label>
                    <input required type="text" name="adminName" value={formData.adminName} onChange={handleChange} placeholder="e.g. Dr. Ram Prakash" className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Official Email (For Magic Link)</label>
                    <input required type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} placeholder="principal@school.com" className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mobile Number</label>
                    <input required type="tel" name="adminPhone" value={formData.adminPhone} onChange={handleChange} placeholder="+91 98765 43210" className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Plan & Submit */}
              <div className="p-8">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-6">
                  <CreditCard size={16} className="text-blue-600" /> 3. Subscription Tier
                </h2>
                <div className="space-y-6">
                  <select name="subscriptionPlan" value={formData.subscriptionPlan} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer">
                    <option value="TRIAL_30_DAYS">30-Day Free Trial</option>
                    <option value="STANDARD_MONTHLY">Standard (Monthly Billing)</option>
                    <option value="PREMIUM_YEARLY">Premium ERP (Annual Billing)</option>
                  </select>

                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 transition-all flex justify-center items-center gap-2">
                    Provision Secure Tenant Ecosystem
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProvisionTenantForm;


// {
//   "tenantData": {
//     "schoolName": "Delhi Public School",
//     "schoolCode": "DPS-5656",
//     "subscriptionPlan": "TRIAL_30_DAYS"
//   },
//   "adminData": {
//     "fullName": "Himanshu Raj",
//     "email": "himanshu72846@gmail.com",
//     "phone": "6202739979",
//     "role": "SUPER_ADMIN"
//   }
// }