import React, { useMemo } from "react";
import { CalendarDays, CalendarClock, CheckCircle2 } from "lucide-react";

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
        title: "Today's Bookings",
        value: todayCount,
        icon: CalendarDays,
        bgColor: "bg-[#6C04D7]/10",
      },
      {
        title: "Upcoming",
        value: upcomingCount,
        icon: CalendarClock,
        bgColor: "bg-[#FFCB1F]/20",
      },
      {
        title: "Completed",
        value: completedCount,
        icon: CheckCircle2,
        bgColor: "bg-[#D2F4E2]",
      },
    ];
  }, [bookings]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={idx}
            className={`py-6 px-8 rounded-2xl flex flex-col justify-between h-[150px] shadow-sm border border-gray-100/50 ${stat.bgColor} transition-all duration-300 hover:scale-[1.01]`}
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

export default BookingStatCards;
