import { Link } from "react-router-dom";
import RegisterForm from "../component/RegisterForm";
import { IonContent, IonPage } from "@ionic/react";
import bg from '../../../assets/bg-auth2.jpg'

const Register = () => {
  return (
    <IonPage>
      <IonContent>
        <div 
          className="min-h-screen flex flex-col justify-center items-center gap-6 p-4 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
        >
          <RegisterForm />
          
          <div className="flex flex-col items-center gap-2">
            <div className="text-gray-700 drop-shadow-md font-medium">
              Already Registered?{" "}
              <Link to="/auth/login" className="text-blue-900 underline">
                Login
              </Link>
            </div>
            
            <Link to="/" className="text-blue-900 hover:scale-105 duration-150 underline drop-shadow-md text-sm">
              Go to Home
            </Link>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;