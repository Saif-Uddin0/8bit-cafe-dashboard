import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import logo from "../../assets/logo-dash.png";
import loginBg from "../../assets/login.png";
import { useAuth } from "../Provider/AuthProvider";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      await login({
        email: data.email,
        password: data.password,
      });

      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Invalid email or password.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 sm:p-6 md:p-8 lg:p-12 font-['Inter',sans-serif]">
      <div className="w-full max-w-[1180px] min-h-[600px] lg:min-h-[640px] flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 lg:gap-16">

        {/* Left */}
        <div className="w-full md:w-1/2 max-w-[460px] mx-auto flex flex-col justify-center py-4 sm:py-6">

          {/* Logo */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <img
              src={logo}
              alt="8bit Cafe"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-sm object-cover"
            />
          </div>

          {/* Title */}
          <div className="mb-6 sm:mb-8 text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              Login
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium leading-relaxed">
              Sign in to your 8bit Cafe dashboard
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 sm:space-y-5"
          >

            {/* Email */}
            <div>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="login-email"
                  type="email"
                  placeholder="Email"
                  disabled={isLoading}
                  {...register("email", {
                    required: "Email is required",
                  })}
                  className="w-full pl-12 pr-4 py-3 sm:py-3.5 border border-gray-200 rounded-xl md:rounded-2xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all placeholder-gray-400 text-gray-900 bg-white disabled:opacity-60"
                />
              </div>

              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="login-password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Password"
                  disabled={isLoading}
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className="w-full pl-12 pr-12 py-3 sm:py-3.5 border border-gray-200 rounded-xl md:rounded-2xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all placeholder-gray-400 text-gray-900 bg-white disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPwd((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1 pb-1">
              <label className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register("remember")}
                  className="w-4 h-4 rounded border-gray-300 text-black accent-black cursor-pointer"
                />

                <span className="text-xs sm:text-sm font-semibold text-gray-700">
                  Remember me
                </span>
              </label>

              <Link
                to="/auth/forget-password"
                className="text-xs sm:text-sm font-bold text-gray-900 hover:text-purple-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-black text-white font-bold text-sm md:text-base rounded-xl hover:bg-gray-900 active:scale-[0.99] transition-all shadow-md mt-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign in"
              )}
            </button>

          </form>
        </div>

        {/* Right */}
        <div className="hidden md:block w-full md:w-1/2 lg:max-w-[560px] h-[520px] md:h-[580px] lg:h-[620px] rounded-[32px] overflow-hidden shadow-sm shrink-0">
          <img
            src={loginBg}
            alt="8bit Cafe Gaming illustration"
            className="w-full h-full object-cover rounded-[32px]"
          />
        </div>

      </div>
    </div>
  );
};

export default Login;