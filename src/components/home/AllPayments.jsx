import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Soft vibrant palette matching user's design reference
const COLORS = [
  "#4E80EE", // Blue
  "#FF8A65", // Coral / Soft Orange
  "#FCD34D", // Soft Yellow
  "#8B5CF6", // Violet
  "#10B981", // Emerald
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F97316", // Orange
];

const formatPaymentMethodName = (name) => {
  if (!name) return "";
  // Clean & humanize names (e.g. Bkash, Nogod, Card, DBBL Visa Card)
  return name
    .replace(/Nagad/gi, "Nogod")
    .replace(/BKash/gi, "Bkash")
    .replace(/DBBLCyberVisaCard/gi, "Visa Card")
    .replace(/DBBLCyberMasterCard/gi, "MasterCard")
    .replace(/DBBLVisaCard/gi, "Visa Card")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
};

const AllPayments = ({ paymentMethods = [], successPercentage = 80, isLoading = false }) => {
  const chartData = (paymentMethods || []).map((pm, i) => ({
    name: formatPaymentMethodName(pm.paymentMethod),
    value: Number(pm.percentage ?? 0),
    count: pm.count,
    totalAmount: pm.totalAmount,
    color: COLORS[i % COLORS.length],
  }));

  const centerPercent = successPercentage ?? 80;

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full min-h-[300px] justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#4E80EE] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full">
      {/* Header */}
      <h2 className="text-lg font-bold text-gray-900 mb-2">Payment Distribution</h2>

      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[220px] text-gray-400 text-sm font-medium">
          No payment data available
        </div>
      ) : (
        <>
          {/* Donut Chart with Center Percentage */}
          <div className="relative w-full h-[210px] flex items-center justify-center my-2 outline-none focus:outline-none [&_*]:outline-none [&_*]:focus:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart className="outline-none focus:outline-none [&_*]:outline-none">
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  cornerRadius={6}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, item) => [
                    `${value}% (${item.payload.count ?? 0} txns)`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Percentage Display */}
            <div className="absolute flex items-center justify-center pointer-events-none">
              <span className="text-3xl font-extrabold text-[#0B132B] tracking-tight">
                {centerPercent}%
              </span>
            </div>
          </div>

          {/* Legend Matching Target UI */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-3 pb-1">
            {chartData.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-[5px] shrink-0 mt-0.5"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-[13px] font-medium text-gray-700">
                    {item.name}
                  </span>
                  <span className="text-[13px] font-bold text-[#0F172A] mt-0.5">
                    {item.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AllPayments;
