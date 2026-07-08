import React from "react";

// Receives transactions from Home.jsx (fetched via TanStack Query)
const TransactionsList = ({ transactions = [] }) => (
  <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full">
    <h2 className="text-lg font-bold text-gray-800 mb-4">Transactions</h2>

    <div className="flex flex-col divide-y divide-gray-100 overflow-y-auto no-scrollbar max-h-[340px]">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex justify-between items-center py-3 hover:bg-gray-50/30 transition-colors">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800">{tx.method}</span>
            <span className="text-xs text-black mt-0.5">
              {tx.detail}
              <span className="ml-1 text-[11px] text-gray-400/80">{tx.time}</span>
            </span>
          </div>
          <span className="text-sm font-bold text-gray-800">{tx.amount}</span>
        </div>
      ))}
    </div>
  </div>
);

export default TransactionsList;
