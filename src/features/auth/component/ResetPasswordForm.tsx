import { useFormik } from "formik";
import * as yup from "yup";
import React, { useState } from "react";
import { HiMiniNoSymbol } from "react-icons/hi2";
import { useHistory } from 'react-router-dom';
import axios from "axios";
import { IonDatetime, IonDatetimeButton, IonModal } from '@ionic/react';
const ResetPasswordForm = () => {
  const history = useHistory();

  const [animateError, setAnimateError] = useState(false);
  const [isApiCall, setIsApiCall] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      dob: "",
    },

    validationSchema: yup.object({
      email: yup
        .string()
        .required("Email is required")
        .email("Invalid eamil Format"),

      dob: yup
        .date()
        .required("Date of Birth is required.")
        .max(new Date(), "Future dates are not allowed."),
    }),

    onSubmit: async (values) => {
      try {
        setIsApiCall(true);
        console.log("data collected", values);
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/auth/forgot-password`,
          values,
        );
        if (response) {
          console.log(response.data)
        }

      } catch (error: any) {
        console.log(error.response);
      } finally {
        setIsApiCall(false);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formik.setTouched({
      email: true,
      dob: true,
    });
    const errors = await formik.validateForm();

    if (Object.keys(errors).length > 0) {
      setAnimateError(true);
      setTimeout(() => setAnimateError(false), 500);
      return;
    }

    formik.handleSubmit(e);
  };

  const firstError =
    (formik.touched.email && formik.errors.email) ||
    (formik.touched.dob && formik.errors.dob) ||
    "";
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
      <h1 className=" text-3xl font-bold text-cyan-600  text-center">
        Reset Password
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 justify-center items-center"
      >
        <input
          type="text"
          name="email"
          placeholder="Enter Email"
          value={formik.values.email}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          className="w-full px-4 py-2 rounded-lg bg-white/70 border outline-none"
        />

        <input
          type="date"
          name="dob"
          value={formik.values.dob}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Select DoB"
          className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 outline-none focus:ring-2 focus:ring-cyan-500"
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
          disabled={isApiCall}
          className="px-5 py-1 bg-blue-700/80 text-white 
          active:scale-110
          hover:scale-105 cursor-pointer hover:bg-blue-700 
          transition ease-in-out duration-100
          disabled:opacity-50
          rounded-lg mt-5 w-full "
        >
          {isApiCall ? (
            "loading"
          ) : "Submit"
          }
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
