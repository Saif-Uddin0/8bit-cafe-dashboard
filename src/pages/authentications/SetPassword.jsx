import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Lock, Eye, EyeOff } from "lucide-react";
import logo from "../../assets/logo-dash.png";
import setPassBg from "../../assets/set-pass.png";

const SetPassword = () => {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    // TODO: call API to set new password
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-[900px] flex flex-col md:flex-row items-stretch rounded-3xl overflow-hidden shadow-xl border border-gray-100">

        {/* ── Left: Form ── */}
        <div className="flex-1 bg-white p-8 md:p-12 flex flex-col justify-center">
          {/* Logo */}
          <div className="mb-8">
            <img src={logo} alt="8bit Cafe" className="w-14 h-14 rounded-2xl" />
          </div>

          <h1
            className="text-2xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "'Jersey 20', sans-serif" }}
          >
            Set a password
          </h1>
          <p
            className="text-sm text-gray-500 mb-8 leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Your previous password has been reseted. Please set a new password
            for your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={set("password")}
                required
                minLength={6}
                className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#532C89]/30 focus:border-[#532C89] placeholder-gray-400"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={form.confirm}
                onChange={set("confirm")}
                required
                className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#532C89]/30 focus:border-[#532C89] placeholder-gray-400"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-black text-white font-semibold text-sm rounded-lg hover:bg-gray-800 transition-colors mt-2"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Done
            </button>
          </form>
        </div>

        {/* ── Right: Illustration ── */}
        <div className="hidden md:block w-[340px] shrink-0">
          <img
            src={setPassBg}
            alt="Set password illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default SetPassword;