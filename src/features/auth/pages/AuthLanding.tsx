import { IonContent, IonPage } from '@ionic/react'
import { Link } from 'react-router-dom'
import bg from '../../../assets/bg-auth2.jpg'

const AuthLanding = () => {
  return (
    <IonPage>
      <IonContent>
        <div 
          className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
        >
          <div className="bg-white/20 backdrop-blur-md p-10 rounded-3xl shadow-2xl text-center border border-white/30">
            <h1 className='text-3xl font-bold font-serif text-black-300 mb-8 drop-shadow-md'>DPS Auth Service</h1>
            <div className='flex gap-4 justify-center'>
              <Link to='/auth/login'>
                <button className='rounded-xl px-8 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition hover:scale-105 shadow-md'>
                  Login
                </button>
              </Link>
              <Link to='/auth/register'>
                <button className='rounded-xl px-8 py-3 bg-blue-500 text-white font-semibold hover:bg-blue-600 transition hover:scale-105 shadow-md'>
                  Register
                </button>
              </Link>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default AuthLanding