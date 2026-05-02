import { useFormik } from "formik";
import * as yup from "yup";
import { HiMiniNoSymbol } from "react-icons/hi2";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import { useState } from "react";
import { IonContent } from "@ionic/react";
import { useHistory } from 'react-router-dom';

const RegisterForm = () => {
  const history  = useHistory();
  const [animateError, setAnimateError] = useState(false);
  const [isApiCall, setIsApiCall] = useState(false)
  const formik = useFormik({
    initialValues: {
      name: "",
      role: "",
      email: "",
      dob: "",
      schoolCode: "",
      password: "",
      confirmPassword: "",
    },

    validationSchema: yup.object({
      name: yup
        .string()
        .required("Name is Required.")
        .trim("No leading/trailing spaces allowed")
        .min(3, "Name must be at least 3 character.")
        .max(30, "Name Can't be more than 30 charracter")
        .matches(/^[a-zA-Z\s]+$/, "only Alphabet Allowed."),

      role: yup.string().required("Please select Role"),

      email: yup
        .string()
        .required("email is required")
        .email("Invalid eamil address"),

      dob: yup
        .date()
        .required("DOB is required")
        .max(new Date(), "Future dates are not allowed"),

      schoolCode: yup
        .string()
        .required("Student id required")
        .matches(/^\d{6}$/, "Must be 6 digits"),

      password: yup
        .string()
        .required("password is required")
        .min(6, "minimum 6 character")
        .max(20, "password length can't be more then 20 character."),

      confirmPassword: yup
        .string()
        .required("Confirm password is required")
        .oneOf([yup.ref("password")], "password must match."),
    }),

    onSubmit: async (data) => {
      try {
        setIsApiCall(true)
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/api/auth/register`,
          data,
        );
        if (response.data.success === true) {
          console.log("Registration Successfull! now you can login.");
          history.push("/auth/login");
        }
      } catch (error: any) {
        const status = error.response?.status;
        if (status === 409) {
          alert("Account already exists please login.");
          history.push("/auth/login");
        }
      } finally {
        setIsApiCall(false)
      }
    },
  });

  const firstError =
    (formik.touched.name && formik.errors.name) ||
    (formik.touched.role && formik.errors.role) ||
    (formik.touched.email && formik.errors.email) ||
    (formik.touched.dob && formik.errors.dob) ||
    (formik.touched.schoolCode && formik.errors.schoolCode) ||
    (formik.touched.password && formik.errors.password) ||
    (formik.touched.confirmPassword && formik.errors.confirmPassword) ||
    "";

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    formik.setTouched({
      name: true,
      role: true,
      email: true,
      dob: true,
      schoolCode: true,
      password: true,
      confirmPassword: true,
    });

    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      setAnimateError(true);
      setTimeout(() => {
        setAnimateError(false);
      }, 500);
      return;
    }
    formik.handleSubmit(e);
  };

  return (
      <form
        onSubmit={handleRegister}
        className="
          w-full max-w-md
          bg-white/1 backdrop-blur-sm
          border border-white/30
          md:rounded-3xl
          p-6 sm:p-8
          space-y-4
          shadow-2xl
          rounded-xl
        "
      >
        <h1 className=" text-3xl font-bold text-blue-800  text-center">
          Register
        </h1>

        <div>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
            className="w-full px-4 py-2 rounded-lg bg-white/70 border outline-none"
          />
          {/* {formik.touched.name && formik.errors.name && (
          <p className="bg-[#341B2A] text-[#F9C1C4] px-1 py-1 rounded-lg flex gap-2 justify-center items-center mt-3">
            <CircleX color="#b13e3e" />
            {formik.errors.name}
          </p>
        )} */}
        </div>

        <div>
          <select
            name="role"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.role}
            className="max-w-60  w-full px-4 py-2 rounded-lg bg-white/70 border outline-none"
          >
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>

          {/* {formik.touched.role && formik.errors.role && (
          <p className="bg-[#341B2A] text-[#F9C1C4] px-1 py-1 rounded-lg flex gap-2 justify-center items-center mt-3">
            <CircleX color="#b13e3e" />
            {formik.errors.role}
          </p>
        )} */}
        </div>

        <div>
          <input
            name="dob"
            type="date"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.dob}
            className="max-w-60  w-full px-4 py-2 rounded-lg cursor-pointer bg-white/70 border outline-none"
          />

          {/* {formik.touched.dob && formik.errors.dob && (
          <p className="bg-[#341B2A] text-[#F9C1C4] px-1 py-1 rounded-lg flex gap-2 justify-center items-center mt-3">
            <CircleX color="#b13e3e" />
            {formik.errors.dob}
          </p>
        )} */}
        </div>

        <div>
          <input
            type="text"
            name="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            className="w-full px-4 py-2 rounded-lg bg-white/70 border outline-none"
            placeholder="Email"
          />
          {/* {formik.touched.email && formik.errors.email && (
          <p className="bg-[#341B2A] text-[#F9C1C4] px-1 py-1 rounded-lg flex gap-2 justify-center items-center mt-3">
            <CircleX color="#b13e3e" />
            {formik.errors.email}
          </p>
        )} */}
        </div>

        <div>
          <input
            type="text"
            name="schoolCode"
            placeholder="School Code"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.schoolCode}
            className="w-full px-4 py-2 rounded-lg bg-white/70  border outline-none"
          />
          {/* {formik.touched.schoolCode && formik.errors.schoolCode && (
          <p className="bg-[#341B2A] text-[#F9C1C4] px-1 py-1 rounded-lg flex gap-2 justify-center items-center mt-3">
            <CircleX color="#b13e3e" />
            {formik.errors.schoolCode}
          </p>
        )} */}
        </div>

        <div>
          <input
            type="password"
            name="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            className="w-full px-4 py-2 rounded-lg bg-white/70 border outline-none"
            placeholder="Password"
          />
          {/* {formik.touched.password && formik.errors.password && (
          <p className="bg-[#341B2A] text-[#F9C1C4] px-1 py-1 rounded-lg flex gap-2 justify-center items-center mt-3">
            <CircleX color="#b13e3e" />
            {formik.errors.password}
          </p>
        )} */}
        </div>

        <div>
          <input
            type="text"
            name="confirmPassword"
            placeholder="Confirm Password "
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
            className="w-full px-4 py-2 rounded-lg bg-white/70 border outline-none"
          />
          {/* {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <p className=" bg-[#341B2A] text-[#F9C1C4] px-1 py-1 rounded-lg flex gap-2 justify-center items-center mt-3">
            <CircleX color="#b13e3e" />
            {formik.errors.confirmPassword}
          </p>
        )} */}
        </div>

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
          disabled={isApiCall}
          className="px-5 py-1 bg-blue-700/80 text-white 
          hover:scale-105 cursor-pointer hover:bg-blue-700 
          transition ease-in-out duration-100
          disabled:cursor-not-allowed disabled:bg-blue-700/40
          rounded-lg mt-5 w-full "
        >
          {isApiCall ? (
            <div className="flex justify-center items-center gap-4">
              Loading.. <FaSpinner className="animate-spin" />
            </div>
          ) : "Register"
          }
        </button>
      </form>
  );
};

export default RegisterForm;
