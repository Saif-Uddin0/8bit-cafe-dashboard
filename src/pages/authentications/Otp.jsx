import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import logo from "../../assets/logo-dash.png";
import verifyBg from "../../assets/verify.png";

const OTP_LENGTH = 6;

const Otp = () => {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const refs = Array.from({ length: OTP_LENGTH }, () => useRef(null));

  const handleChange = (idx, val) => {
    // Accept only a single digit
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = digit;
    setDigits(next);
    // Auto-advance
    if (digit && idx < OTP_LENGTH - 1) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next = [...digits];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    refs[focusIdx].current?.focus();
    e.preventDefault();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: verify OTP
    navigate("/auth/set-password");
  };

  const handleResend = () => {
    setDigits(Array(OTP_LENGTH).fill(""));
    refs[0].current?.focus();
    // TODO: resend OTP API call
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
              Verify code
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium leading-relaxed">
              An authentication code has been sent to your email.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Boxes */}
            <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={refs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-14 text-center border border-black rounded-lg md:rounded-2xl text-lg sm:text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all bg-white"
                />
              ))}
            </div>

            {/* Resend */}
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Didn't receive a code?{" "}
              <button
                type="button"
                onClick={handleResend}
                className="font-bold text-gray-900 hover:text-purple-700 transition-colors cursor-pointer"
              >
                Resend
              </button>
            </p>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 bg-black text-white font-bold text-sm md:text-base rounded-xl hover:bg-gray-900 active:scale-[0.99] transition-all shadow-md cursor-pointer"
            >
              Continue
            </button>
          </form>
        </div>

        {/* ── Right: Illustration ── */}
        <div className="hidden md:block w-full md:w-1/2 lg:max-w-[560px] h-[520px] md:h-[580px] lg:h-[620px] rounded-[32px] overflow-hidden shadow-sm shrink-0">
          <img
            src={verifyBg}
            alt="Verify code illustration"
            className="w-full h-full object-cover rounded-[32px]"
          />
        </div>

      </div>
    </div>
  );
};

export default Otp;