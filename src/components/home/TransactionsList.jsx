import React from "react";

const TransactionsList = () => {
  const transactions = Array(7).fill({
    method: "Bkash",
    detail: "Fifa26 - John Smith",
    time: "9:30 AM",
    amount: "200 Tk",
  });

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">Transactions</h2>
      </div>

      <div className="flex flex-col divide-y divide-gray-100 overflow-y-auto no-scrollbar max-h-[340px]">
        {transactions.map((tx, index) => (
          <div key={index} className="flex justify-between items-center py-3 first:pt-0 last:pb-0 hover:bg-gray-50/30 transition-colors">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">
                {tx.method}
              </span>
              <span className="text-xs text-gray-400 mt-0.5">
                {tx.detail} <span className="ml-1 text-[11px] text-gray-400/80">{tx.time}</span>
              </span>
            </div>
            <div className="text-sm font-bold text-gray-800">
              {tx.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsList;
