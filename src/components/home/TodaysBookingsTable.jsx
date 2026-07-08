import React from "react";
import TableScrollWrapper from "../global/TableScrollWrapper";

// Receives today's bookings from Home.jsx (fetched via TanStack Query)
const TodaysBookingsTable = ({ bookings = [] }) => {
  const today = new Date().toLocaleDateString("en-GB").split("/").join("-"); // DD-MM-YYYY

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">Today's Bookings</h2>
        <p className="text-xs text-gray-400 font-semibold mt-0.5">{today}</p>
      </div>

      <TableScrollWrapper minWidth="500px">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100">
              {["Customer", "Service", "Payment", "Time"].map((h) => (
                <th key={h} className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 pr-4 text-sm font-semibold text-gray-800 whitespace-nowrap">{b.customer}</td>
                <td className="py-3 pr-4 text-sm text-gray-600 whitespace-nowrap">{b.service}</td>
                <td className="py-3 pr-4 text-sm text-gray-600 whitespace-nowrap">{b.payment}</td>
                <td className="py-3 text-sm text-gray-600 whitespace-nowrap">{b.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScrollWrapper>
    </div>
  );
};

export default TodaysBookingsTable;
