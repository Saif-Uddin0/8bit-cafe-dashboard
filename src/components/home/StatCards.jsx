import React from "react";
import { CalendarCheck2, Wallet, Gamepad2, CupSoda } from "lucide-react";

const StatCards = () => {
  const stats = [
    {
      title: "TOTAL BOOKINGS",
      value: "696",
      icon: CalendarCheck2,
      bgColor: "bg-[#EFF2FE]", 
      iconColor: "text-[#3B82F6]",
    },
    {
      title: "TOTAL REVENUE",
      value: "950,380 Tk",
      icon: Wallet,
      bgColor: "bg-[#FEF5E7]", 
      iconColor: "text-[#F59E0B]",
    },
    {
      title: "TOTAL GAMES",
      value: "6",
      icon: Gamepad2,
      bgColor: "bg-[#F5EEFD]", 
      iconColor: "text-[#8B5CF6]",
    },
    {
      title: "TOTAL FOODS",
      value: "69",
      icon: CupSoda, 
      bgColor: "bg-[#F6F0FA]", 
      iconColor: "text-[#EC4899]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={idx}
            className={`p-6 rounded-2xl flex flex-col justify-between h-[150px] shadow-sm border border-gray-100/50 ${stat.bgColor} transition-all duration-300 hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between">
              <span className={`p-2 rounded-lg bg-white/60 ${stat.iconColor} shadow-sm`}>
                <IconComponent size={24} strokeWidth={1.8} />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-800 leading-tight">
                {stat.value}
              </h3>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 tracking-wider mt-1 uppercase">
                {stat.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;
