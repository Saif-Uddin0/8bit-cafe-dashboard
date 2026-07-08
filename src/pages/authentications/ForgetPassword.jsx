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
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-[900px] flex flex-col md:flex-row items-stretch rounded-3xl overflow-hidden shadow-xl border border-gray-100">

        {/* ── Left: Form ── */}
        <div className="flex-1 bg-white p-8 md:p-12 flex flex-col justify-center">
          {/* Logo */}
          <div className="mb-6">
            <img src={logo} alt="8bit Cafe" className="w-14 h-14 rounded-2xl" />
          </div>

          {/* Back link */}
          <Link
            to="/auth/login"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#532C89] transition-colors mb-5"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <ChevronLeft size={14} />
            Back to login
          </Link>

          <h1
            className="text-2xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "'Jersey 20', sans-serif" }}
          >
            Forgot your password?
          </h1>
          <p
            className="text-sm text-gray-500 mb-8 leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Don't worry, happens to all of us. Enter your email below to recover
            your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#532C89]/30 focus:border-[#532C89] placeholder-gray-400"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-black text-white font-semibold text-sm rounded-lg hover:bg-gray-800 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Continue
            </button>
          </form>
        </div>

        {/* ── Right: Illustration ── */}
        <div className="hidden md:block w-[340px] shrink-0">
          <img
            src={forgetBg}
            alt="Forgot password illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;