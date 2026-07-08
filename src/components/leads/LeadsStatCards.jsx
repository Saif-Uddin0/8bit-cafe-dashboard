import React from "react";
import { Users, Gamepad2, CupSoda } from "lucide-react";

const LeadsStatCards = ({ leads = [] }) => {
  const totalLeads = leads.length;
  const gameLeads = leads.filter((l) => l.source === "Game").length;
  const foodLeads = leads.filter((l) => l.source === "Food").length;

  const stats = [
    {
      title: "TOTAL LEADS",
      value: totalLeads,
      icon: Users,
      bgColor: "bg-[#234EB71A]",
      iconColor: "text-black",
    },
    {
      title: "GAME LEADS",
      value: gameLeads,
      icon: Gamepad2,
      bgColor: "bg-[#FEF5E7]",
      iconColor: "text-black",
    },
    {
      title: "FOOD LEADS",
      value: foodLeads,
      icon: CupSoda,
      bgColor: "bg-[#7744B31A]",
      iconColor: "text-black",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={idx}
            className={`p-6 rounded-2xl flex flex-col justify-between h-[150px] shadow-sm border border-gray-100/50 ${stat.bgColor} transition-all duration-300 hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between">
              <span className={`${stat.iconColor}`}>
                <IconComponent size={24} strokeWidth={1.8} />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl md:text-3xl font-bold text-[#191C1E] leading-tight">
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

export default LeadsStatCards;
