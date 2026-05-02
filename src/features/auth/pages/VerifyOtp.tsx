import OtpBox from '../component/OtpBox'
import { IonContent, IonPage } from '@ionic/react'
import otpBg from '../../../assets/otp-bg.png'

const VerifyOtp: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <div
          className="
            min-h-screen 
            grid 
            grid-cols-1 md:grid-cols-2   
            items-center
            p-4
            bg-cover
            bg-no-repeat
            bg-[position:20%_center]
            md:bg-center"
          style={{
            backgroundImage: `url(${otpBg})`
          }}
        >
          {/* Left side (hidden on mobile) */}
          <div className="hidden md:block"></div>

          {/* OTP Box Centered */}
          <div className="flex justify-center items-center">
            <OtpBox />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default VerifyOtp;