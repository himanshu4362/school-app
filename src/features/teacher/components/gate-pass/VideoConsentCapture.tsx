import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { setVideoUrl, submitGatePass } from '../../../../store/slices/gatePassSlice';
import { Video, StopCircle, RefreshCcw, ShieldCheck, Loader2 } from 'lucide-react';

const VideoConsentCapture: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedStudentId, formData } = useSelector((state: RootState) => state.gatePass);
  const student = useSelector((state: RootState) => state.student.records[selectedStudentId!]);

  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [timer, setTimer] = useState(15);
  const todayDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    let interval: any;
    if (isRecording && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      handleStop();
    }
    return () => clearInterval(interval);
  }, [isRecording, timer]);

  const handleStart = () => {
    setIsRecording(true);
    setTimer(15);
  };

  const handleStop = async () => {
    setIsRecording(false);
    setIsUploading(true);
    
    // 🟢 MOCKED S3 POST SIMULATION (Wait 2 seconds)
    setTimeout(() => {
      const mockS3Url = `https://aws-s3-edu-vault.com/consent/${selectedStudentId}-${Date.now()}.mp4`;
      dispatch(setVideoUrl(mockS3Url));
      dispatch(submitGatePass('EMP-001')); // Teacher ID
      setIsUploading(false);
    }, 2500);
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-2xl mx-auto w-full">
      
      {/* THE PROMPTER SCRIPT */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 animate-pulse"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 mb-4">Voice Signature Script</p>
        <p className="text-xl sm:text-2xl font-black leading-relaxed">
          "I am <span className="text-rose-400">{student?.firstName} {student?.lastName}</span>. 
          I am leaving school early due to <span className="text-rose-400">{formData.reason}</span>. 
          Today is {todayDate}."
        </p>
      </div>

      {/* VIRTUAL CAMERA VIEW */}
      <div className="aspect-[4/3] bg-slate-200 rounded-[32px] relative overflow-hidden border-4 border-white shadow-xl flex items-center justify-center">
        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="text-rose-600 animate-spin" size={48} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-600">Uploading to Secure Vault...</p>
          </div>
        ) : isRecording ? (
          <>
             <div className="absolute top-4 left-6 flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-rose-600 animate-pulse" />
               <span className="text-xs font-black text-rose-600 uppercase tracking-widest">Recording: {timer}s</span>
             </div>
             <div className="w-48 h-48 rounded-full border-4 border-rose-500/20 flex items-center justify-center">
                <Video size={64} className="text-rose-200 opacity-50" />
             </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
              <Video size={32} />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Camera Ready</p>
          </div>
        )}
      </div>

      {/* CONTROLS */}
      {!isUploading && (
        <div className="flex gap-4">
          {!isRecording ? (
            <button onClick={handleStart} className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl">
              <Video size={20} /> Start Recording
            </button>
          ) : (
            <button onClick={handleStop} className="flex-1 bg-rose-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl animate-pulse">
              <StopCircle size={20} /> Stop & Authorize
            </button>
          )}
          <button className="w-16 h-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
            <RefreshCcw size={20} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest pt-4">
        <ShieldCheck size={14} className="text-emerald-500" />
        Encrypted End-to-End Digital Consent
      </div>
    </div>
  );
};

export default VideoConsentCapture;