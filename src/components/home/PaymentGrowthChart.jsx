import React, { useState, useRef, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";

const PERIODS = [
  { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "thisYear",  label: "This Year"  },
];

// Receives chartData object from Home.jsx (fetched via TanStack Query)
const PaymentGrowthChart = ({ chartData = {} }) => {
  const [period, setPeriod] = useState("thisMonth");
  const [open, setOpen]     = useState(false);
  const dropdownRef         = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeLabel = PERIODS.find((p) => p.key === period)?.label;
  const activeData  = chartData[period] ?? [];

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">Payment Growth</h2>

        {/* Period selector dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {activeLabel}
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {open && (
            <div className="absolute right-0 mt-1.5 w-32 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
              {PERIODS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { setPeriod(key); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${period === key ? "text-[#532C89] font-bold" : "text-gray-600"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Area Chart */}
      <div className="w-full h-[250px] mt-auto">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activeData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#25CD25" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#25CD25" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#EBEFF3" strokeWidth={0.5} strokeDasharray="0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }} domain={[0, 800]} ticks={[0, 400, 500, 600, 800]} dx={-5} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "12px" }}
              labelStyle={{ fontWeight: "bold", color: "#374151" }}
              itemStyle={{ color: "#10B981", fontWeight: 600 }}
            />
            <Area type="linear" dataKey="growth" stroke="#25CD25" strokeWidth={1.07} strokeDasharray="3 3" fill="url(#colorGrowth)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PaymentGrowthChart;
