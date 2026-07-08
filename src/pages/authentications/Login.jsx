import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import logo from "../../assets/logo-dash.png";
import loginBg from "../../assets/login.png";

const Login = () => {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: false });

  const set = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: real auth — for now go to dashboard
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-[900px] flex flex-col md:flex-row items-stretch gap-0 rounded-3xl overflow-hidden shadow-xl border border-gray-100">

        {/* ── Left: Form ── */}
        <div className="flex-1 bg-white p-8 md:p-12 flex flex-col justify-center">
          {/* Logo */}
          <div className="mb-6">
            <img src={logo} alt="8bit Cafe" className="w-14 h-14 rounded-2xl" />
          </div>

          <h1
            className="text-3xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: "'Jersey 20', sans-serif" }}
          >
            Login
          </h1>
          <p className="text-sm text-gray-500 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
            Join the elite network of Canadian grooming
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={set("email")}
                required
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#532C89]/30 focus:border-[#532C89] placeholder-gray-400"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={set("password")}
                required
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

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer" style={{ fontFamily: "'Inter', sans-serif" }}>
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={set("remember")}
                  className="w-3.5 h-3.5 accent-[#532C89]"
                />
                Remember me
              </label>
              <Link
                to="/auth/forget-password"
                className="text-sm text-gray-700 hover:text-[#532C89] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-black text-white font-semibold text-sm rounded-lg hover:bg-gray-800 transition-colors mt-2"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Sign in
            </button>
          </form>
        </div>

        {/* ── Right: Illustration ── */}
        <div className="hidden md:block w-[340px] shrink-0">
          <img
            src={loginBg}
            alt="Login illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;