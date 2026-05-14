import { useFormik } from "formik";
import * as yup from "yup";
import { HiMiniNoSymbol } from "react-icons/hi2";
import { FaSpinner } from "react-icons/fa";
import { useState } from "react";
import { useHistory } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { setupNewPassword } from "../../../store/slices/authSlice"; // Adjust path

const SetupPasswordForm = () => {
  const history = useHistory();
  const dispatch = useDispatch<any>();
  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const userRole = parsedUser?.role;

  const [animateError, setAnimateError] = useState(false);
  const [isApiCall, setIsApiCall] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },

    validationSchema: yup.object({
      password: yup
        .string()
        .required("New password is required")
        .min(6, "Password must dddddbe at least 6 characters long.")
        .max(20, "Password can't exceed 20 characters."),

      confirmPassword: yup
        .string()
        .required("Confirm password is required")
        .oneOf([yup.ref("password")], "Passwords must match."),
    }),

    onSubmit: async (values) => {
      try {
        setIsApiCall(true);
        setSetupError(null);
        console.log(values);
        // Dispatch setup password thunk
        await dispatch(setupNewPassword(values.password)).unwrap();

        // On success, redirect them to their dashboard
        switch (userRole) {
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

      } catch (error: any) {
        setSetupError(error || "Failed to update password. Please try again.");
        setAnimateError(true);
        setTimeout(() => setAnimateError(false), 500);
      } finally {
        setIsApiCall(false);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formik.setTouched({ password: true, confirmPassword: true });

    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      setAnimateError(true);
      setTimeout(() => setAnimateError(false), 500);
      return;
    }
    await formik.submitForm();
  };

  const firstError =
    (formik.touched.password && formik.errors.password) ||
    (formik.touched.confirmPassword && formik.errors.confirmPassword) ||
    setupError ||
    "";

  return (
    <div className="flex flex-col justify-center items-center gap-3 w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] p-4 sm:p-6 md:p-8 bg-white/20 backdrop-blur-sm border border-white/20 shadow-2xl rounded-2xl">
      <h1 className="text-2xl font-bold text-cyan-600 text-center leading-tight mb-2">
        Initialize Security
      </h1>
      <p className="text-sm text-slate-800 text-center font-medium mb-4">
        For your security, you must replace your temporary system-generated password with a permanent one.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 justify-center items-center w-full">
        <input
          type="password"
          name="password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
          className="w-full px-4 py-2 rounded-lg bg-white/70 border border-black outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="New Password"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.confirmPassword}
          className="w-full px-4 py-2 rounded-lg bg-white/70 border border-black outline-none focus:ring-2 focus:ring-cyan-500"
        />

        {/* ErrorBox */}
        {firstError && (
          <div className={`w-full flex justify-center items-center gap-2 p-3 bg-red-400/50 rounded-sm backdrop-blur-2xl text-sm border border-red-300/30 ${animateError ? "shake" : ""}`}>
            <HiMiniNoSymbol className="shrink-0" />
            <span>{firstError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isApiCall}
          className="w-full px-5 py-3 bg-blue-700/90 text-white hover:scale-105 cursor-pointer hover:bg-blue-700 transition ease-in-out duration-100 disabled:cursor-not-allowed disabled:bg-blue-700/40 rounded-xl mt-2 font-bold shadow-lg"
        >
          {isApiCall ? (
            <div className="flex justify-center items-center gap-3">
              Encrypting... <FaSpinner className="animate-spin" />
            </div>
          ) : "Save Password & Enter"}
        </button>
      </form>
    </div>
  );
};

export default SetupPasswordForm;