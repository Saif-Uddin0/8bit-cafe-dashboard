import React from "react";
import { CalendarCheck2, Wallet, Gamepad2, CupSoda } from "lucide-react";

const StatCards = ({
  totalTransaction = 0,
  totalAmount = 0,
  totalGame = 0,
  totalFood = 0,
  isLoading = false,
}) => {
  const stats = [
    {
      title: "TOTAL TRANSACTIONS",
      value: isLoading ? "..." : (totalTransaction ?? 0),
      icon: CalendarCheck2,
      bgColor: "bg-[#234EB71A]",
      iconColor: "text-[#000000]",
    },
    {
      title: "TOTAL REVENUE",
      value: isLoading
        ? "..."
        : `${Number(totalAmount ?? 0).toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })} Tk`,
      icon: Wallet,
      bgColor: "bg-[#FEF5E7]",
      iconColor: "text-[#000000]",
    },
    {
      title: "TOTAL GAMES",
      value: isLoading ? "..." : (totalGame ?? 0),
      icon: Gamepad2,
      bgColor: "bg-[#7744B31A]",
      iconColor: "text-[#000000]",
    },
    {
      title: "TOTAL FOODS",
      value: isLoading ? "..." : (totalFood ?? 0),
      icon: CupSoda,
      bgColor: "bg-[#7744B31A]",
      iconColor: "text-[#000000]",
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
              <span className={`${stat.iconColor}`}>
                <IconComponent size={24} strokeWidth={1.8} />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl md:text-3xl font-bold text-[#191C1E] leading-tight">
                {stat.value}
              </h3>
              <p className="text-xs md:text-sm font-semibold text-[#475569] tracking-wider mt-1.5 uppercase">
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
