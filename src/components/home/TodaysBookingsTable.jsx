import React from "react";
import TableScrollWrapper from "../global/TableScrollWrapper";

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

const TodaysBookingsTable = ({ gamesbooking = [], isLoading = false }) => {
  const today = new Date().toLocaleDateString("en-GB").split("/").join("-");

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full min-h-[350px]">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">Today's Game Transactions</h2>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : gamesbooking.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm font-medium py-12">
          No game transactions today
        </div>
      ) : (
        <TableScrollWrapper minWidth="500px">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100">
                {["Customer", "Payment Method", "Amount", "Time", "Status"].map((h) => (
                  <th
                    key={h}
                    className="pb-3 pr-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {gamesbooking.map((item) => (
                <tr key={item.id || item.gameBookingId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 pr-4 text-sm font-semibold text-gray-800 whitespace-nowrap">
                    <div>
                      <p className="font-semibold text-gray-900">{item.customerName || "Customer"}</p>
                      {item.customerPhone && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.customerPhone}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-700 font-medium whitespace-nowrap">
                    {formatPaymentMethodName(item.paymentMethod)}
                  </td>
                  <td className="py-3 pr-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                    {item.amount} Tk
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-700 font-medium whitespace-nowrap">
                    {formatTime(item.createdAt)}
                  </td>
                  <td className="py-3 text-sm whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full uppercase ${
                        item.status === "SUCCESS"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-amber-50 text-amber-600 border border-amber-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScrollWrapper>
      )}
    </div>
  );
};

export default TodaysBookingsTable;
