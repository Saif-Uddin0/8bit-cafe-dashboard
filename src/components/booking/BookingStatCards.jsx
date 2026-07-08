import React, { useMemo } from "react";

// Helper to parse DD-MM-YYYY to a comparable Date object
const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// Helper to get today's date formatted as DD-MM-YYYY
const getTodayString = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const BookingStatCards = ({ bookings = [] }) => {
  const stats = useMemo(() => {
    const todayStr = getTodayString();
    const todayDate = parseDate(todayStr);

    let todayCount = 0;
    let upcomingCount = 0;
    let completedCount = 0;

    bookings.forEach((booking) => {
      if (booking.status === "Cancelled") return;

      const bookingDate = parseDate(booking.date);
      
      // 1. Today's Bookings
      if (booking.date === todayStr) {
        todayCount++;
      }

      // 2. Upcoming Bookings (future dates)
      if (bookingDate > todayDate) {
        upcomingCount++;
      }

      // 3. Completed Bookings (explicitly "Completed" status OR past dates that are Paid/Completed)
      if (
        booking.status === "Completed" || 
        (bookingDate < todayDate && (booking.status === "Paid" || booking.status === "Completed"))
      ) {
        completedCount++;
      }
    });

    return [
      {
        title: "TODAY'S BOOKINGS",
        value: todayCount,
        bgColor: "bg-[#6C04D7]/22",
        textColor: "text-[#532C89]",
      },
      {
        title: "UPCOMING",
        value: upcomingCount,
        bgColor: "bg-[#FFCB1F]/22",
        textColor: "text-[#C28130]",
      },
      {
        title: "COMPLETED",
        value: completedCount,
        bgColor: "bg-[#D2F4E2]",
        textColor: "text-[#008F11]/22",
      },
    ];
  }, [bookings]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`p-6 rounded-2xl flex flex-col justify-between h-[120px] shadow-sm border border-gray-100/30 ${stat.bgColor} transition-all duration-300 hover:scale-[1.02]`}
        >
          <div>
            <h3 className="text-3xl font-extrabold text-gray-800 leading-none">
              {stat.value}
            </h3>
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-bold text-gray-500 tracking-wider uppercase">
              {stat.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingStatCards;
