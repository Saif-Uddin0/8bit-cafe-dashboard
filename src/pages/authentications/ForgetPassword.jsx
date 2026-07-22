import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, ChevronLeft } from "lucide-react";
import logo from "../../assets/logo-dash.png";
import forgetBg from "../../assets/forget-pass.png";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: send reset email — navigate to OTP page
    navigate("/auth/otp");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 sm:p-6 md:p-8 lg:p-12 font-['Inter',sans-serif]">
      <div className="w-full max-w-[1180px] min-h-[600px] lg:min-h-[640px] flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 lg:gap-16">

        {/* ── Left: Form ── */}
        <div className="w-full md:w-1/2 max-w-[460px] mx-auto flex flex-col justify-center py-4 sm:py-6">
          {/* Logo */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <img
              src={logo}
              alt="8bit Cafe"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-sm object-cover"
            />
          </div>

          {/* Back link */}
          <div className="mb-4">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={16} />
              Back to login
            </Link>
          </div>

          {/* Title & Subtitle */}
          <div className="mb-6 sm:mb-8 text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              Forgot your password?
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium leading-relaxed">
              Don't worry, happens to all of us. Enter your email below to recover your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email */}
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 sm:py-3.5 border border-gray-200 rounded-xl md:rounded-2xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all placeholder-gray-400 text-gray-900 bg-white"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 bg-black text-white font-bold text-sm md:text-base rounded-xl hover:bg-gray-900 active:scale-[0.99] transition-all shadow-md mt-2 cursor-pointer"
            >
              Continue
            </button>
          </form>
        </div>

        {/* ── Right: Illustration ── */}
        <div className="hidden md:block w-full md:w-1/2 lg:max-w-[560px] h-[520px] md:h-[580px] lg:h-[620px] rounded-[32px] overflow-hidden shadow-sm shrink-0">
          <img
            src={forgetBg}
            alt="Forgot password illustration"
            className="w-full h-full object-cover rounded-[32px]"
          />
        </div>

      </div>
    </div>
  );
};

export default ForgetPassword;