import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";

// Mock datasets for the periods
const dataSets = {
  thisMonth: [
    { name: "Jan", growth: 380 },
    { name: "mar", growth: 420 },
    { name: "may", growth: 520 },
    { name: "jul", growth: 510 },
    { name: "aug", growth: 540 },
    { name: "oct", growth: 630 },
    { name: "dec", growth: 660 },
  ],
  lastMonth: [
    { name: "Jan", growth: 250 },
    { name: "mar", growth: 310 },
    { name: "may", growth: 450 },
    { name: "jul", growth: 400 },
    { name: "aug", growth: 490 },
    { name: "oct", growth: 520 },
    { name: "dec", growth: 590 },
  ],
  thisYear: [
    { name: "Jan", growth: 450 },
    { name: "mar", growth: 510 },
    { name: "may", growth: 600 },
    { name: "jul", growth: 580 },
    { name: "aug", growth: 640 },
    { name: "oct", growth: 710 },
    { name: "dec", growth: 750 },
  ],
};

const PaymentGrowthChart = () => {
  const [period, setPeriod] = useState("thisMonth");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeData = dataSets[period];

  const getPeriodLabel = () => {
    switch (period) {
      case "thisMonth":
        return "This Month";
      case "lastMonth":
        return "Last Month";
      case "thisYear":
        return "This Year";
      default:
        return "This Month";
    }
  };

  const handlePeriodChange = (val) => {
    setPeriod(val);
    setDropdownOpen(false);
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">Payment Growth</h2>
        
        {/* Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {getPeriodLabel()}
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-32 bg-white border border-gray-150 rounded-xl shadow-lg z-20 py-1">
              <button
                onClick={() => handlePeriodChange("thisMonth")}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${
                  period === "thisMonth" ? "text-[#532C89] font-bold" : "text-gray-600"
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => handlePeriodChange("lastMonth")}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${
                  period === "lastMonth" ? "text-[#532C89] font-bold" : "text-gray-600"
                }`}
              >
                Last Month
              </button>
              <button
                onClick={() => handlePeriodChange("thisYear")}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${
                  period === "thisYear" ? "text-[#532C89] font-bold" : "text-gray-600"
                }`}
              >
                This Year
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-[250px] mt-auto">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={activeData}
            margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
              domain={[0, 800]}
              ticks={[0, 400, 500, 600, 800]}
              dx={-5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
              }}
              labelStyle={{ fontWeight: "bold", color: "#374151" }}
              itemStyle={{ color: "#10B981", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="growth"
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorGrowth)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PaymentGrowthChart;
