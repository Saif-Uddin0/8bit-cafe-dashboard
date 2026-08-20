import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import TableScrollWrapper from "../../components/global/TableScrollWrapper";
import useAxiosSecure from "../../hooks/useAxios";
import CalendarBookingModal from "../../components/booking/CalendarBookingModal";

// Expanded time slots matching operating business hours (13 slots, 09:00 AM - 10:00 PM)
const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
];

// Curated colors for game station columns matching figma palette
const STATION_COLORS = [
  { bgClass: "bg-[#CBEFFF]", textClass: "text-[#1E293B]" }, // Light Blue
  { bgClass: "bg-[#EEDBFF]", textClass: "text-[#1E293B]" }, // Lavender
  { bgClass: "bg-[#FFEED6]", textClass: "text-[#1E293B]" }, // Light Peach
  { bgClass: "bg-[#FFD6D6]", textClass: "text-[#1E293B]" }, // Light Coral
  { bgClass: "bg-[#D2E3FF]", textClass: "text-[#1E293B]" }, // Sky Blue
  { bgClass: "bg-[#E6F4EA]", textClass: "text-[#1E293B]" }, // Light Green
];

// Helper to format date display in the header, e.g. "Monday, Jun 22"
const formatHeaderDate = (date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

// Compact Booking Card Component
const BookingCard = ({ booking, bgClass, top, height, onClick }) => (
  <div
    onClick={onClick}
    className={`${bgClass} rounded-[10px] py-1.5 px-3 text-center transition-all hover:opacity-95 hover:scale-[0.99] shadow-sm flex flex-col justify-center items-center overflow-hidden border border-black/5 cursor-pointer`}
    style={{
      position: "absolute",
      top: `${top}px`,
      height: `${height}px`,
      left: "8px",
      right: "8px",
      zIndex: 10,
    }}
  >
    <p className="font-bold text-[#1E293B] text-xs sm:text-[13px] leading-tight truncate w-full">
      {booking.user ? `${booking.user.firstName || ""} ${booking.user.lastName || ""}` : "Guest User"}
    </p>
    {height >= 40 && (
      <p className="text-[#4B5563] text-[9px] sm:text-[10px] mt-0.5 select-all font-semibold leading-none truncate w-full">
        {booking.user?.phone || "—"}
      </p>
    )}
    {height >= 60 && (
      <p className="text-[#64748B] text-[8px] sm:text-[9px] mt-1 font-bold leading-none">
        {booking.durationMin} min
      </p>
    )}
  </div>
);

// MAIN SCHEDULE COMPONENT
const Schedule = () => {
  const axiosSecure = useAxiosSecure();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  // Query 1: Fetch active games dynamically
  const { data: games = [], isLoading: isLoadingGames, isError: isErrorGames } = useQuery({
    queryKey: ["games", "columns"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/games?limit=100");
      return res.data?.data?.data || [];
    },
  });

  // Query 2: Fetch bookings
  const { data: bookings = [], isLoading: isLoadingBookings, isError: isErrorBookings, refetch } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/booking/all-bookings?limit=10000");
      return res.data?.data?.data || [];
    },
  });

  const handlePrevDay = () => {
    setCurrentDate((prev) => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
  };

  const handleNextDay = () => {
    setCurrentDate((prev) => new Date(prev.getTime() + 24 * 60 * 60 * 1000));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const isLoading = isLoadingGames || isLoadingBookings;
  const isError = isErrorGames || isErrorBookings;

  // Map games to calendar column definitions
  const columns = React.useMemo(() => {
    return games.map((game, index) => {
      const color = STATION_COLORS[index % STATION_COLORS.length];
      return {
        id: game.id,
        name: game.name,
        bgClass: color.bgClass,
        textClass: color.textClass,
      };
    });
  }, [games]);

  // Filter bookings to active ones matching the selected date
  const filteredBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      if (!b.startTime) return false;
      const statusUpper = b.status?.toUpperCase();
      if (statusUpper === "CANCELLED" || statusUpper === "EXPIRED") return false;

      const bDate = new Date(b.startTime);
      return (
        bDate.getDate() === currentDate.getDate() &&
        bDate.getMonth() === currentDate.getMonth() &&
        bDate.getFullYear() === currentDate.getFullYear()
      );
    });
  }, [bookings, currentDate]);

  // Calculate layout parameters
  const rowHeight = 96; // Height of an hourly slot in px
  const dayStartMinutes = 9 * 60; // 09:00 AM

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-8 mt-2 px-2 md:px-4">
      {/* Card Wrapper */}
      <div className="bg-white border border-gray-200/80 rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">

        {/* Header containing title and navigation */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Schedule</h2>
            <p className="text-sm text-gray-500 mt-1">{formatHeaderDate(currentDate)}</p>
          </div>

          {/* Date controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevDay}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={handleToday}
              className="bg-[#007AFF] text-white hover:bg-blue-600 font-semibold px-6 py-1.5 rounded-lg text-sm transition-colors shadow-sm cursor-pointer"
            >
              Today
            </button>

            <button
              onClick={handleNextDay}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Conditional States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-semibold text-sm">Loading schedule...</p>
          </div>
        ) : isError ? (
          <div className="p-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex flex-col items-center gap-3">
            <p className="font-semibold text-sm">Failed to load schedule data.</p>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 rounded-xl text-xs font-bold text-red-700 hover:bg-red-50 cursor-pointer shadow-sm"
            >
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        ) : columns.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-400">
            No games found in database. Create games to display calendar columns.
          </div>
        ) : (
          /* Reusable Scroll Wrapper for professional mobile responsiveness */
          <TableScrollWrapper minWidth={`${columns.length * 180 + 120}px`}>
            <table className="w-full border-collapse border border-gray-200 table-fixed">
              <thead>
                <tr>
                  {/* TIME column header */}
                  <th className="border border-gray-200 bg-gray-50 text-center py-4 text-xs sm:text-sm lg:text-base font-bold text-[#1E293B] uppercase tracking-wider w-28 select-none">
                    TIME
                  </th>

                  {/* Game station headers */}
                  {columns.map((station) => (
                    <th
                      key={station.id}
                      className={`border border-gray-200 ${station.bgClass} ${station.textClass} text-center py-4 text-xs sm:text-sm lg:text-base font-bold tracking-wide truncate`}
                    >
                      {station.name}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {TIME_SLOTS.map((time, rowIdx) => (
                  <tr key={time}>
                    {/* Time label cell */}
                    <td
                      className="border border-gray-200 bg-white text-center text-xs sm:text-sm lg:text-base font-semibold text-[#1E293B] select-none"
                      style={{ height: `${rowHeight}px` }}
                    >
                      {time}
                    </td>

                    {/* Column cells are declared on Row 0 and stretch all rows down using rowSpan */}
                    {rowIdx === 0 &&
                      columns.map((col) => {
                        // Gather bookings assigned to this column
                        const colBookings = filteredBookings.filter((b) => b.game?.id === col.id);

                        return (
                          <td
                            key={col.id}
                            rowSpan={TIME_SLOTS.length}
                            className="border border-gray-200 bg-white p-0 relative align-top select-none"
                            style={{ height: `${rowHeight * TIME_SLOTS.length}px` }}
                          >
                            {/* Grid Horizontal Guide Lines */}
                            {Array.from({ length: TIME_SLOTS.length - 1 }).map((_, idx) => (
                              <div
                                key={idx}
                                className="absolute left-0 right-0 border-b border-gray-100"
                                style={{
                                  top: `${(idx + 1) * rowHeight}px`,
                                  height: "0px",
                                }}
                              />
                            ))}

                            {/* Booking Cards overlay */}
                            {colBookings.map((b) => {
                              const bStart = new Date(b.startTime);
                              const bMinutes = bStart.getHours() * 60 + bStart.getMinutes();
                              const offsetMinutes = bMinutes - dayStartMinutes;

                              // Position calculation
                              const top = (offsetMinutes / 60) * rowHeight;
                              const height = (b.durationMin / 60) * rowHeight;

                              return (
                                <BookingCard
                                  key={b.id}
                                  booking={b}
                                  bgClass={col.bgClass}
                                  top={top}
                                  height={height}
                                  onClick={() => setSelectedBookingId(b.id)}
                                />
                              );
                            })}
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScrollWrapper>
        )}
      </div>

      {/* portal Modal overview */}
      {selectedBookingId && (
        <CalendarBookingModal
          bookingId={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
        />
      )}
    </div>
  );
};

export default Schedule;