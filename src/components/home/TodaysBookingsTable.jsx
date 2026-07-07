import React from "react";

const TodaysBookingsTable = () => {
  const bookings = [
    { customer: "Amara Osei", service: "Fifa26", payment: "200 Tk", time: "10.00 am" },
    { customer: "Amara Osei", service: "Food", payment: "200 Tk", time: "10.00 am" },
    { customer: "Amara Osei", service: "Fifa26", payment: "200 Tk", time: "10.00 am" },
    { customer: "Amara Osei", service: "Food", payment: "200 Tk", time: "10.00 am" },
  ];

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">Todays Bookings</h2>
        <p className="text-xs text-gray-400 font-semibold mt-0.5">05-06-2026</p>
      </div>

      {/* Responsive table wrapper for dragging/scrolling on mobile devices */}
      <div className="overflow-x-auto w-full custom-scrollbar">
        <table className="w-full min-w-[500px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Service
              </th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Payment
              </th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((booking, index) => (
              <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 text-sm font-semibold text-gray-800">
                  {booking.customer}
                </td>
                <td className="py-4 text-sm text-gray-600">
                  {booking.service}
                </td>
                <td className="py-4 text-sm text-gray-600">
                  {booking.payment}
                </td>
                <td className="py-4 text-sm text-gray-600">
                  {booking.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TodaysBookingsTable;
