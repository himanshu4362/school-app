import React from "react";
import { Link } from "react-router-dom";
import ResetPasswordForm from "../component/ResetPasswordForm";
import { IonContent, IonPage } from "@ionic/react";
import bg from '../../../assets/bg-auth2.jpg'

const ResetPassword = () => {
  return (
    <IonPage>
      <IonContent>
        <div 
          className="min-h-screen flex flex-col justify-center items-center gap-6 p-4 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
        >
          <ResetPasswordForm />
          
          <div className="text-zinc-800 drop-shadow-md font-medium">
            Remembered your password?{" "}
            <Link to="/auth/login" className="text-blue-800 hover:text-black underline transition">
              Login
            </Link>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default ResetPassword;