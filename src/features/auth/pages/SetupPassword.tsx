import React from "react";
import { IonContent, IonPage } from "@ionic/react";
import SetupPasswordForm from "../component/SetupPasswordForm";
import bg from '../../../assets/bg-auth2.jpg'; // Adjust path if needed

const SetupPassword = () => {
  return (
    <IonPage>
      <IonContent>
        <div 
          className="min-h-screen flex flex-col justify-center items-center gap-6 p-4 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
        >
          <SetupPasswordForm />
        </div>
      </IonContent>
    </IonPage>
  );
}

export default SetupPassword;