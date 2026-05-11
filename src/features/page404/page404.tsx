import React from 'react';
import { Link } from 'react-router-dom';
import { IonPage } from '@ionic/react';

const page404: React.FC = () => {
    return (
        <IonPage>
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-24 sm:py-32 lg:px-8 w-full">
                <div className="text-center max-w-lg mx-auto">
                    <p className="text-base font-black text-blue-600 tracking-widest uppercase">404 Error</p>
                    <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                        Page not found
                    </h1>
                    <p className="mt-6 text-base font-bold text-slate-500">
                        Sorry, the module you are looking for is currently under construction or does not exist.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        {/* React Router Link prevents the hard reload bug */}
                        <Link 
                            to="/teacher" 
                            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all w-full sm:w-auto"
                        >
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </IonPage>
    );
};

export default page404;