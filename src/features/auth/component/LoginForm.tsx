import { useFormik } from "formik";
import { Link, useHistory } from 'react-router-dom';
import { useState } from "react";
import { HiMiniNoSymbol } from "react-icons/hi2";
import { FaSpinner } from "react-icons/fa";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { loginUser } from "../../../store/slices/authSlice"; // Adjust path to your slice

const LoginForm = () => {
  const history = useHistory();
  const dispatch = useDispatch<any>();
  const [animateError, setAnimateError] = useState(false);
  const [isApiCall, setIsApiCall] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },

    validationSchema: yup.object({
      email: yup
        .string()
        .required("Email is required.")
        .email("This is not in correct email format."),

      password: yup
        .string()
        .required("Password is required.")
        .min(6, "Password must be at least 6 digits")
        .max(20, "Password can't be more then 20 character."),
    }),

    onSubmit: async (values) => {
      try {
        setIsApiCall(true);
        setLoginError(null);

        // Dispatch the Redux Thunk and unwrap the result
        const response = await dispatch(loginUser(values)).unwrap();

        if (response.isFirstLogin) {
          history.push("/auth/setup-password");
        } else {
          switch (response.user.role) {
            case "SUPER_ADMIN":
            case "admin":
              history.push("/admin/dashboard");
              break;
            case "teacher":
              history.push("/teacher");
              break;
            case "student":
              history.push("/student");
              break;
            default:
              history.push("/");
          }
        }
      } catch (error: any) {
        setLoginError(error || "Invalid credentials. Please try again.");
        setAnimateError(true);
        setTimeout(() => setAnimateError(false), 500);
      } finally {
        setIsApiCall(false);
      }
    },
  });

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    formik.setTouched({ email: true, password: true });

    const error = await formik.validateForm();

    if (Object.keys(error).length > 0) {
      setAnimateError(true);
      setTimeout(() => setAnimateError(false), 500);
      return;
    }

    formik.handleSubmit(e);
  };

  const firstError =
    (formik.touched.email && formik.errors.email) ||
    (formik.touched.password && formik.errors.password) ||
    loginError ||
    "";

  return (
    <div className="flex flex-col justify-center items-center gap-3 w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] p-4 sm:p-6 md:p-8 bg-white/20 backdrop-blur-sm border border-white/20 shadow-2xl rounded-2xl">
      <h1 className="text-3xl font-bold text-cyan-600 text-center">Login</h1>
      <form
        className="flex flex-col gap-3 justify-center items-center w-full"
        onSubmit={handleLoginSubmit}
      >
        <input
          name="email"
          type="text"
          placeholder="Enter email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full outline-none border border-black rounded p-2 bg-white/50 focus:ring-2 focus:ring-blue-300"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full outline-none border border-black rounded p-2 bg-white/50 focus:ring-2 focus:ring-blue-300"
        />

        {/* ErrorBox */}
        {firstError && (
          <div
            className={`w-full flex justify-center items-center gap-2 p-3 bg-red-400/50 rounded-sm backdrop-blur-2xl text-sm border border-red-300/30 ${animateError ? "shake" : ""}`}
          >
            <HiMiniNoSymbol className="shrink-0" />
            <span className="truncate">{firstError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isApiCall}
          className="px-8 py-2 bg-blue-600 text-white rounded-xl outline-none border border-blue-400 cursor-pointer transition duration-150 hover:scale-105 hover:bg-blue-700 text-lg mt-2 disabled:opacity-70 flex items-center gap-2"
        >
          {isApiCall ? <><FaSpinner className="animate-spin" /> Verifying...</> : 'Login'}
        </button>
      </form>
      <Link to="/auth/forgot-password" className="text-cyan-600 underline mt-2">
        Forgot Password
      </Link>
    </div>
  );
};

export default LoginForm;