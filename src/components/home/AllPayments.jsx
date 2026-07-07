import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Bkash", value: 43, color: "#4F8AFF" }, // Blue
  { name: "Nogod", value: 37, color: "#FF7F5C" }, // Orange/Peach
  { name: "Card", value: 20, color: "#FFD15C" },  // Yellow
];

const AllPayments = () => {
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-gray-800">All Payments</h2>
      </div>

      {/* Donut Chart with Absolute Centered Label */}
      <div className="relative w-full h-[200px] flex items-center justify-center mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Label */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-[#1F2937]">80%</span>
        </div>
      </div>

      {/* Legend Grid */}
      <div className="flex justify-center gap-8 mt-5 pb-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2.5">
            <span
              className="w-3 h-3 rounded-full mt-1 shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-[#64748B]">{item.name}</span>
              <span className="text-sm font-bold text-[#1E293B] mt-0.5">{item.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllPayments;
