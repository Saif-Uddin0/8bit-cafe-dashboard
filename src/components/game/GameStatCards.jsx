import React from "react";
import { Gamepad2, Play } from "lucide-react";

// GameStatCards renders the counts of all and available games
const GameStatCards = ({ games = [] }) => {
  const totalCount = games.length;
  const availableCount = games.filter((g) => g.status === "Available").length;

  const stats = [
    {
      title: "ALL GAMES",
      value: totalCount,
      icon: Gamepad2,
      bgColor: "bg-[#EEF2F6]", // Pastel Gray-Blue
    },
    {
      title: "AVAILABLE GAME",
      value: availableCount,
      icon: Play,
      bgColor: "bg-[#00FF1E]/20", // Pastel Green
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

export default GameStatCards;
