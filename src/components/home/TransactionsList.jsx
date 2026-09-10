import React from "react";

const formatPaymentMethodName = (name) => {
  if (!name) return "";
  return name
    .replace(/DBBL/g, "DBBL ")
    .replace(/Cyber/g, "Cyber ")
    .replace(/Visa/g, "Visa ")
    .replace(/MasterCard/g, "MasterCard ")
    .replace(/Card/g, "Card")
    .replace(/\s+/g, " ")
    .trim();
};

const formatTime = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
};

const TransactionsList = ({ foodsBooking = [], isLoading = false }) => (
  <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full min-h-[350px]">
    <h2 className="text-lg font-bold text-gray-800 mb-4">Today's Food Transactions</h2>

    {isLoading ? (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin" />
      </div>
    ) : foodsBooking.length === 0 ? (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm font-medium py-12">
        No food transactions today
      </div>
    ) : (
      <div className="flex flex-col divide-y divide-gray-100 overflow-y-auto no-scrollbar max-h-[340px]">
        {foodsBooking.map((item) => (
          <div
            key={item.id || item.foodOrderId}
            className="flex justify-between items-center py-3 hover:bg-gray-50/30 transition-colors"
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">
                {item.customerName || "Customer"}
              </span>
              <span className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                <span>{formatPaymentMethodName(item.paymentMethod)}</span>
                <span>•</span>
                <span className="text-[11px] text-gray-400">{formatTime(item.createdAt)}</span>
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-gray-800">{item.amount} Tk</span>
              <span
                className={`text-[10px] font-bold ${
                  item.status === "SUCCESS" ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default TransactionsList;
