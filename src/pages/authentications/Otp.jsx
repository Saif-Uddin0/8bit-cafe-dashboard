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
            Verify code
          </h1>
          <p
            className="text-sm text-gray-500 mb-8"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            An authentication code has been sent to your email.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Boxes */}
            <div className="flex items-center gap-2 sm:gap-3" onPaste={handlePaste}>
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
                  className="w-11 h-11 sm:w-12 sm:h-12 text-center border border-gray-200 rounded-lg text-sm font-semibold text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-[#532C89]/40 focus:border-[#532C89] transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              ))}
            </div>

            {/* Resend */}
            <p className="text-xs text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
              Didn't receive a code?{" "}
              <button
                type="button"
                onClick={handleResend}
                className="font-semibold text-gray-900 hover:text-[#532C89] transition-colors"
              >
                Resend
              </button>
            </p>

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
            src={verifyBg}
            alt="Verify code illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Otp;