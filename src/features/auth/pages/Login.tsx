import { Link } from "react-router-dom"
import LoginForm from "../component/LoginForm"
import { IonContent, IonPage } from "@ionic/react"
import bg from '../../../assets/bg-auth2.jpg'

const Login = () => {
  return (
    <IonPage>
      <IonContent>
        <div 
          className="min-h-screen flex flex-col justify-center items-center gap-6 p-4 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
        >
          <LoginForm />
          
          <div className="text-blue-800 drop-shadow-md font-medium">
            New User? <Link to='/auth/register' className="text-blue-800 hover:text-blue-700 underline transition">Register</Link>
          </div>
          
          <Link to='/' className='text-blue-600 hover:text-black underline drop-shadow-md transition'>
            Go to Home
          </Link>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default Login;