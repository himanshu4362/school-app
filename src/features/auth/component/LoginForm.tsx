import { useFormik } from "formik";
import { Link, useHistory } from 'react-router-dom';
import { useState } from "react";
import { HiMiniNoSymbol } from "react-icons/hi2";
import * as yup from "yup";
import axios from "axios";
import { IonContent } from "@ionic/react";

const LoginForm = () => {
  const history = useHistory();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },

    validationSchema: yup.object({
      email: yup
        .string()
        .required("Student id is required.")
        .email("This is not in correct email format."),

      password: yup
        .string()
        .required()
        .min(8, "Password must me at least 6 digits")
        .max(20, "Password can't be more then 20 character."),
    }),

    onSubmit: async (values) => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/api/auth/login`,
          values,
        );

        if (response.status === 200 && response.data.user.role) {
          // FIX: Store the token and user data[cite: 1]
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));

          history.push(`/${response.data.user.role}`);
        }
        // ... rest of logic
      } catch (error) {
        // FIX: Add user-facing error handling here
        console.error("Login failed", error);
      }
    },
  });

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    formik.setTouched({
      email: true,
      password: true,
    });

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
    "";
  const [animateError, setAnimateError] = useState(false);

  return (
    <div
      className=" 
      flex flex-col justify-center items-center gap-3 
      w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%]
      p-4 sm:p-6 md:p-8

      bg-white/20
      backdrop-blur-sm
      border border-white/20
      shadow-2xl
      rounded-2xl

    "
    >
      <h1 className=" text-3xl font-bold text-cyan-600  text-center">Login</h1>
      <form
        className="flex flex-col gap-3 justify-center items-center"
        onSubmit={handleLoginSubmit}
      >
        <input
          name="email"
          type="text"
          placeholder="Enter email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="outline-none
          border border-black rounded  p-2 bg-white/50 focus:ring-2 focus:ring-blue-300
        "
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className=" outline-none
          border border-black  rounded  p-2 bg-white/50 focus:ring-2 focus:ring-blue-300
        "
        />

        {/* ErrorBox */}
        {firstError && (
          <div
            className={`flex justify-center items-center gap-2 p-3
           bg-red-400/50 rounded-sm backdrop-blur-2xl 
           text-sm border border-red-300/30
           ${animateError ? "shake" : ""}
           `}
          >
            <HiMiniNoSymbol />
            {firstError}
          </div>
        )}

        <button
          type="submit"
          className="
          px-3 py-1 bg-blue-600 rounded-xl outline-none border
           border-blue-400 cursor-pointer transition duration-150
            hover:scale-110 text-xl
        "
        >
          Login
        </button>
      </form>
      <Link to="/auth/reset-password" className="text-cyan-600 underline ">
        Forgot Password
      </Link>
    </div>
  );
};

export default LoginForm;
