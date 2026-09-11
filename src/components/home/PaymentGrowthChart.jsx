import React, { useState, useRef, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";

const YEARS = [2026, 2025, 2024, 2023];

const PaymentGrowthChart = ({
  growthData = {},
  selectedYear = new Date().getFullYear(),
  onYearChange,
  isLoading = false,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const chartPoints = growthData?.data || [];

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full relative min-h-[320px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Payment Growth</h2>
          {growthData?.totalAmount !== undefined && (
            <p className="text-xs text-gray-600 font-semibold mt-0.5">
              Total: {Number(growthData.totalAmount).toLocaleString()} Tk ({growthData.totalTransactions ?? 0} txns)
            </p>
          )}
        </div>

        {/* Year selector dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {selectedYear}
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {open && (
            <div className="absolute right-0 mt-1.5 w-28 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
              {YEARS.map((yr) => (
                <button
                  key={yr}
                  onClick={() => {
                    if (onYearChange) onYearChange(yr);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${
                    selectedYear === yr ? "text-[#532C89] font-bold bg-purple-50/50" : "text-gray-600"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : chartPoints.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm font-medium">
          No growth data for {selectedYear}
        </div>
      ) : (
        /* Area Chart */
        <div className="w-full h-[250px] mt-auto outline-none focus:outline-none [&_*]:outline-none [&_*]:focus:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartPoints} margin={{ top: 10, right: 5, left: -15, bottom: 0 }} className="outline-none focus:outline-none [&_*]:outline-none">
              <defs>
                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#25CD25" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#25CD25" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#EBEFF3" strokeWidth={0.5} strokeDasharray="0" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 11, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 11, fontWeight: 500 }}
                tickFormatter={(v) => `${v}`}
                dx={-5}
              />
              <Tooltip
                formatter={(value, name, item) => [
                  `${Number(value).toLocaleString()} Tk (${item.payload.transactionCount ?? 0} txns)`,
                  "Revenue",
                ]}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ fontWeight: "bold", color: "#374151" }}
                itemStyle={{ color: "#10B981", fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#25CD25"
                strokeWidth={1.5}
                fill="url(#colorGrowth)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default PaymentGrowthChart;
