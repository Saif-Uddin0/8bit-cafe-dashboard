import React from "react";
import { Utensils, CheckCircle, XCircle } from "lucide-react";

// FoodStatCards renders total, available, and unavailable food category summaries
const FoodStatCards = ({ foods = [] }) => {
  const totalCount = foods.length;
  const availableCount = foods.filter((f) => {
    if (f.status) return f.status === "Available";
    return f.isDelete !== true;
  }).length;
  const unavailableCount = totalCount - availableCount;

  const stats = [
    {
      title: "ALL FOODS",
      value: totalCount,
      icon: Utensils,
      bgColor: "bg-[#EEF2F6]", // Pastel Gray-Blue
    },
    {
      title: "AVAILABLE FOODS",
      value: availableCount,
      icon: CheckCircle,
      bgColor: "bg-[#00FF1E]/20", // Light Pastel Green
    },
    {
      title: "UNAVAILABLE FOODS",
      value: unavailableCount,
      icon: XCircle,
      bgColor: "bg-[#FF0000]/10", // Light Pastel Red
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.title}
            className={`py-6 px-8 rounded-2xl flex flex-col justify-between h-[150px] shadow-sm border border-gray-100 ${stat.bgColor} transition-all duration-300 hover:scale-[1.01]`}
          >
            {/* Icon */}
            <div className="text-gray-700">
              <IconComponent size={24} strokeWidth={2} />
            </div>

            {/* Value & Label */}
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                {stat.value}
              </h3>
              <p className="text-[10px] md:text-xs font-bold text-[#64748B] tracking-wider mt-1 uppercase">
                {stat.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FoodStatCards;
