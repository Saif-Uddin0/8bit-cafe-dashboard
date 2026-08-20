import React, { useMemo } from "react";

// Helper to check if a UTC timestamp is today in client's timezone
const isToday = (utcString) => {
  if (!utcString) return false;
  const bookingDate = new Date(utcString);
  const today = new Date();
  return (
    bookingDate.getDate() === today.getDate() &&
    bookingDate.getMonth() === today.getMonth() &&
    bookingDate.getFullYear() === today.getFullYear()
  );
};

// Helper to check if a UTC timestamp is in the future in client's timezone
const isUpcoming = (utcString) => {
  if (!utcString) return false;
  const bookingDate = new Date(utcString);
  const now = new Date();
  return bookingDate > now;
};

// Helper to check if a booking is completed
const isCompleted = (booking) => {
  if (!booking?.startTime) return false;
  if (booking.gameStatus === "ENDED") return true;

  const bookingDate = new Date(booking.startTime);
  const now = new Date();
  // If the booking date/time is in the past and it is PAID
  return bookingDate < now && booking.status === "PAID";
};

const BookingStatCards = ({ bookings = [] }) => {
  const stats = useMemo(() => {
    let todayCount = 0;
    let upcomingCount = 0;
    let completedCount = 0;

    bookings.forEach((booking) => {
      // Exclude cancelled and expired bookings from calculations
      const statusUpper = booking.status?.toUpperCase();
      if (statusUpper === "CANCELLED" || statusUpper === "EXPIRED") return;

      // 1. Today's Bookings
      if (isToday(booking.startTime)) {
        todayCount++;
      }

      // 2. Upcoming Bookings
      if (isUpcoming(booking.startTime)) {
        upcomingCount++;
      }

      // 3. Completed Bookings
      if (isCompleted(booking)) {
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
