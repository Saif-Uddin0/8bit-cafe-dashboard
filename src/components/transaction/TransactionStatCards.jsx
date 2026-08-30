import React from "react";
import { Wallet, CheckCircle, Clock, XCircle } from "lucide-react";

// Accepts the `data` object from /api/payment/all-transection-counter
const TransactionStatCards = ({ stats = {} }) => {
  const totalCount   = stats.totalTransaction ?? 0;
  const successCount = stats.status?.success?.count  ?? 0;
  const pendingCount = stats.status?.pending?.count   ?? 0;
  // Combine failed + cancelled into one "Failed / Cancelled" card
  const failedCount  = (stats.status?.failed?.count    ?? 0)
                     + (stats.status?.cancelled?.count ?? 0);

  const cards = [
    {
      title:   "Total Transactions",
      value:   totalCount,
      icon:    Wallet,
      bgColor: "bg-[#EEF2F6]",
    },
    {
      title:   "Completed / Success",
      value:   successCount,
      icon:    CheckCircle,
      bgColor: "bg-[#00FF1E]/10",
    },
    {
      title:   "Pending",
      value:   pendingCount,
      icon:    Clock,
      bgColor: "bg-[#FFCB1F]/20",
    },
    {
      title:   "Failed / Cancelled",
      value:   failedCount,
      icon:    XCircle,
      bgColor: "bg-[#FF0000]/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.title}
            className={`py-6 px-8 rounded-2xl flex flex-col justify-between h-[150px] shadow-sm border border-gray-100/50 ${stat.bgColor}`}
          >
            {/* Icon */}
            <div className="text-gray-700">
              <IconComponent size={24} strokeWidth={1.8} />
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

export default TransactionStatCards;
