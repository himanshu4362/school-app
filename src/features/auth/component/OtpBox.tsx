import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";

const OtpBox = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);
  const [isResendActive, setIsResendActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const startTimer = () => {
    setIsResendActive(false);
    setTimer(30);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setIsResendActive(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return interval;
  };

  useEffect(() => {
    const interval = startTimer();
    return () => clearInterval(interval);
  }, []);

  // Handle Pasting explicitly 
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    // Get pasted data, remove non-digits, and slice to max length of 6
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 6);
    
    if (!pastedData) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      newOtp[index] = char;
    });

    setOtp(newOtp);

    // Focus the next empty input or the last input
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleChange = (value: string, index: number) => {
    // Allow clearing the input on backspace
    if (value === "") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    // Normal typing - ensure it's a number
    if (!/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleResend = () => {
    if (!isResendActive || loading) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      startTimer();
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (submitLoading) return;

    const finalOtp = otp.join("");

    if (finalOtp.length < 6) {
      setError("Please enter complete OTP");
      return;
    }

    setError("");
    setSubmitLoading(true);

    // simulate API
    setTimeout(() => {
      setSubmitLoading(false);
      console.log(finalOtp);
    }, 1000);
  };

  return (
    <div
      className="
        w-full max-w-md
        mx-auto
        flex flex-col items-center gap-4
        p-5 sm:p-6 md:p-8
        bg-white/20 backdrop-blur-md
        border border-white/20
        shadow-2xl rounded-2xl
      "
    >
      <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit}>
        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-600 text-center">
          OTP Verification
        </h1>

        <p className="text-center text-sm sm:text-base">
          Enter OTP sent to your email
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-between gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              ref={(el) => { inputRefs.current[index] = el; }}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="
                w-10 h-10 sm:w-12 sm:h-12
                text-center text-lg sm:text-xl
                rounded-lg border bg-[#C5CEE4]
                outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          ))}
        </div>

        {/* Resend */}
        <div className="text-center text-sm">
          {!isResendActive ? (
            <span className="text-gray-600">
              Resend OTP in {timer}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-blue-700 underline"
            >
              {loading ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">
            {error}
          </div>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={submitLoading}
          className="
          w-full mt-4 py-2
          bg-blue-700 text-white rounded-lg
          disabled:opacity-50
          hover:scale-105 transition"
        >
          {submitLoading ? "Verifying..." : "Submit"}
        </button>
      </form>

      <Link to="/" className="text-blue-700 text-sm text-center">
        Go to Home
      </Link>
    </div>
  );
};

export default OtpBox;