import React from "react";
import { LayoutGrid, Gamepad2, CupSoda } from "lucide-react";

// CategoryStatCards displays the summarized counts of categories
const CategoryStatCards = ({ categories = [] }) => {
  // Count categories by type
  const totalCount = categories.length;
  const gameCount = categories.filter((c) => {
    const type = c.type?.toUpperCase();
    return type === "GAMES" || type === "GAME";
  }).length;
  const foodCount = categories.filter((c) => c.type?.toUpperCase() === "FOOD").length;

  const cards = [
    {
      title: "ALL CATEGORY",
      value: totalCount,
      icon: LayoutGrid,
      bgColor: "bg-[#EBFDF5]", // Pastel green
    },
    {
      title: "GAME CATEGORY",
      value: gameCount,
      icon: Gamepad2,
      bgColor: "bg-[#F3F4F6]", // Pastel gray/light-blue
    },
    {
      title: "FOOD CATEGORY",
      value: foodCount,
      icon: CupSoda,
      bgColor: "bg-[#EEF2F6]", // Pastel lavender/blue
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.title}
            className={`p-6 rounded-2xl flex flex-col justify-between h-[150px] shadow-sm border border-gray-100 ${card.bgColor}`}
          >
            {/* Top Icon */}
            <div className="text-gray-700">
              <IconComponent size={24} strokeWidth={2} />
            </div>

            {/* Bottom Value & Title */}
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                {card.value}
              </h3>
              <p className="text-[10px] md:text-xs font-bold text-[#64748B] tracking-wider mt-1 uppercase">
                {card.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryStatCards;
