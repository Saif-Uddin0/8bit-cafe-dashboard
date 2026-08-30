import React, { useState, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, RefreshCw, CalendarDays } from "lucide-react";
import TableScrollWrapper from "../../components/global/TableScrollWrapper";
import useAxiosSecure from "../../hooks/useAxios";
import CalendarBookingModal from "../../components/booking/CalendarBookingModal";

// ── Time Slots: 09:00 AM → 12:00 AM (midnight) — 15 hourly rows ──────────────
// Each row represents a 1-hour block. The midnight boundary is the end of the
// last row (11:00 PM–12:00 AM). No separate 12:00 AM label needed.
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
  "10:00 PM",
  "11:00 PM",
  "12:00 AM",
];

// Curated colors for game station columns — cycles automatically for any number of games
const STATION_COLORS = [
  { bgClass: "bg-[#CBEFFF]", textClass: "text-[#1E293B]" }, // Light Blue
  { bgClass: "bg-[#EEDBFF]", textClass: "text-[#1E293B]" }, // Lavender
  { bgClass: "bg-[#FFEED6]", textClass: "text-[#1E293B]" }, // Light Peach
  { bgClass: "bg-[#FFD6D6]", textClass: "text-[#1E293B]" }, // Light Coral
  { bgClass: "bg-[#D2E3FF]", textClass: "text-[#1E293B]" }, // Sky Blue
  { bgClass: "bg-[#E6F4EA]", textClass: "text-[#1E293B]" }, // Light Green
  { bgClass: "bg-[#FFF3CD]", textClass: "text-[#1E293B]" }, // Warm Yellow
  { bgClass: "bg-[#D6EFE4]", textClass: "text-[#1E293B]" }, // Teal Tint
];

// ── Date helpers ──────────────────────────────────────────────────────────────
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isToday = (date) => isSameDay(date, new Date());

// "Sat, Aug 22, 2026" — always shows real date, never hardcodes "Today"
const formatBadgeDate = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// "Saturday, Aug 22, 2026"
const formatHeaderDate = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// yyyy-mm-dd for <input type="date">
const toInputValue = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// ── Booking Card ─────────────────────────────────────────────────────────────
const BookingCard = ({ booking, bgClass, top, height, onClick, onHover }) => (
  <div
    onClick={onClick}
    onMouseEnter={onHover}
    className={`${bgClass} rounded-[8px] py-2 px-5 text-center transition-all hover:opacity-90 hover:scale-[0.99] shadow-sm flex flex-col justify-center items-center overflow-hidden border border-black/5 cursor-pointer`}
    style={{
      position: "absolute",
      top: `${top}px`,
      height: `${Math.max(height, 32)}px`,
      left: "4px",
      right: "4px",
      zIndex: 10,
    }}
  >
    <p className="font-bold text-[#1E293B] text-[12px] leading-tight truncate w-full text-center">
      {booking.user
        ? `${booking.user.firstName || ""} ${booking.user.lastName || ""}`.trim() || "Guest"
        : "Guest User"}
    </p>
    {height >= 42 && (
      <p className="text-[#4B5563] text-[10px] mt-1 select-all font-semibold leading-none truncate w-full text-center">
        {booking.user?.phone || "—"}
      </p>
    )}
    {height >= 64 && (
      <p className="text-[#64748B] text-[9px] mt-1 font-bold leading-none">
        {booking.durationMin} min
      </p>
    )}
  </div>
);

// ── MAIN SCHEDULE COMPONENT ───────────────────────────────────────────────────
const Schedule = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dateInputRef = useRef(null);

  // ── Data Queries ─────────────────────────────────────────────────────────────

  // Query 1: Active games — drives calendar columns dynamically
  const {
    data: games = [],
    isLoading: isLoadingGames,
    isError: isErrorGames,
  } = useQuery({
    queryKey: ["games", "columns"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/games?limit=100");
      return res.data?.data?.data || [];
    },
  });

  // Query 2: All bookings for full-day view
  const {
    data: bookings = [],
    isLoading: isLoadingBookings,
    isError: isErrorBookings,
    refetch,
  } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/booking/all-bookings?limit=10000");
      return res.data?.data?.data || [];
    },
  });

  // ── Navigation handlers ───────────────────────────────────────────────────────
  const handlePrevDay = () =>
    setCurrentDate((prev) => new Date(prev.getTime() - 24 * 60 * 60 * 1000));

  const handleNextDay = () =>
    setCurrentDate((prev) => new Date(prev.getTime() + 24 * 60 * 60 * 1000));

  const handleToday = () => setCurrentDate(new Date());

  const handleDateInputChange = (e) => {
    if (!e.target.value) return;
    const [y, m, d] = e.target.value.split("-").map(Number);
    // Construct in local time to avoid UTC offset shifting the date
    setCurrentDate(new Date(y, m - 1, d));
  };

  // Open the native date picker on badge click
  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.click();
    }
  };

  // ── Refresh with loading indicator — prevents duplicate concurrent refreshes ──
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["bookings"] }),
        queryClient.invalidateQueries({ queryKey: ["games", "columns"] }),
        refetch(),
      ]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  }, [isRefreshing, queryClient, refetch]);

  // ── Derived data ──────────────────────────────────────────────────────────────
  const isLoading = isLoadingGames || isLoadingBookings;
  const isError = isErrorGames || isErrorBookings;
  const selectedIsToday = isToday(currentDate);

  // Map games from API → column definitions (dynamic, no hardcoding)
  const columns = React.useMemo(
    () =>
      games.map((game, index) => {
        const color = STATION_COLORS[index % STATION_COLORS.length];
        return {
          id: game.id,
          name: game.name,
          bgClass: color.bgClass,
          textClass: color.textClass,
        };
      }),
    [games]
  );

  // Filter bookings: active ones on the selected date only
  const filteredBookings = React.useMemo(
    () =>
      bookings.filter((b) => {
        if (!b.startTime) return false;
        const statusUpper = b.status?.toUpperCase();
        if (statusUpper === "CANCELLED" || statusUpper === "EXPIRED") return false;
        return isSameDay(new Date(b.startTime), currentDate);
      }),
    [bookings, currentDate]
  );


  const rowHeight = 88;
  const dayStartMinutes = 9 * 60; // 09:00 AM = 540 minutes

  const minCalendarWidth = `${90 + columns.length * 160 + 2}px`;


  const prefetchBooking = useCallback(
    (bookingId) => {
      queryClient.prefetchQuery({
        queryKey: ["bookingDetails", bookingId],
        queryFn: async () => {
          const res = await axiosSecure.get(`/api/booking/booking-details/${bookingId}`);
          return res.data;
        },
        staleTime: 60 * 1000, // treat as fresh for 60 s
      });
    },
    [queryClient, axiosSecure]
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-[1600px] mx-auto pb-8 mt-2 px-2 md:px-4">
      {/* Card Wrapper */}
      <div className="bg-white border border-gray-200/80 rounded-[16px] p-4 md:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <p className="text-md text-gray-900 font-semibold mt-0.5">
              {selectedIsToday ? "Today — " : ""}{formatHeaderDate(currentDate)}
            </p>
          </div>

          {/* Date navigation controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Previous day */}
            <button
              onClick={handlePrevDay}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
              title="Previous day"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Date badge — always shows the real date, never shows "Today" text */}
            <button
              onClick={openDatePicker}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer select-none"
              title="Pick a date"
            >
              <CalendarDays size={14} className="text-[#532C89] shrink-0" />
              <span className="whitespace-nowrap text-xs font-semibold text-gray-700">
                {formatBadgeDate(currentDate)}
              </span>
              {/* Hidden native date input */}
              <input
                ref={dateInputRef}
                type="date"
                value={toInputValue(currentDate)}
                onChange={handleDateInputChange}
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
                tabIndex={-1}
                aria-hidden="true"
              />
            </button>

            {/* Next day */}
            <button
              onClick={handleNextDay}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
              title="Next day"
            >
              <ChevronRight size={18} />
            </button>

            {/* Today quick-jump — only shown when NOT on today */}
            {!selectedIsToday && (
              <button
                onClick={handleToday}
                className="bg-[#532C89] text-white hover:bg-[#6b3aad] font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                Today
              </button>
            )}

            {/* Refresh — spinner while refreshing, blocks duplicate requests */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                isRefreshing
                  ? "text-[#532C89] bg-purple-50 cursor-not-allowed"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
              title="Refresh schedule"
            >
              <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* ── Conditional States ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-semibold text-sm">Loading schedule...</p>
          </div>
        ) : isError ? (
          <div className="p-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex flex-col items-center gap-3">
            <p className="font-semibold text-sm">Failed to load schedule data.</p>
            <button
              onClick={handleRefresh}
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
          /* Horizontal scroll — gracefully handles any number of game columns */
          <TableScrollWrapper minWidth={minCalendarWidth}>
            <table
              className="border-collapse border border-gray-200"
              style={{ width: "100%", tableLayout: "fixed" }}
            >
              <colgroup>
                {/* TIME column — fixed narrow width */}
                <col style={{ width: "90px" }} />
                {/* Game columns — equal share of remaining space, min 160px */}
                {columns.map((col) => (
                  <col key={col.id} style={{ minWidth: "160px" }} />
                ))}
              </colgroup>

              <thead>
                <tr>
                  {/* TIME header */}
                  <th className="border border-gray-200 bg-gray-50 text-center py-3 text-[10px] font-bold text-[#1E293B] uppercase tracking-widest select-none">
                    TIME
                  </th>

                  {/* Game station headers — fully dynamic from /api/games */}
                  {columns.map((station) => (
                    <th
                      key={station.id}
                      className={`border border-gray-200 ${station.bgClass} ${station.textClass} text-center py-3 px-2 font-bold tracking-wide`}
                      style={{ verticalAlign: "middle" }}
                    >
                      {/* Two-line clamp: readable for long names, compact for short ones */}
                      <span
                        className="block leading-snug text-[11px] sm:text-[14px]"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          wordBreak: "break-word",
                        }}
                        title={station.name}
                      >
                        {station.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {TIME_SLOTS.map((time, rowIdx) => (
                  <tr key={time}>
                    {/* Time label — top-aligned so label sits at the hour boundary */}
                    <td
                      className="border border-gray-200 bg-white text-center text-[13px] font-semibold text-[#64748B] select-none align-top pt-1"
                      style={{ height: `${rowHeight}px`, whiteSpace: "nowrap" }}
                    >
                      {time}
                    </td>

                    {/* ── Column cells ──
                        Only declared on row 0; rowSpan stretches full height.
                        Absolute-positioned booking cards for pixel accuracy. */}
                    {rowIdx === 0 &&
                      columns.map((col) => {
                        const colBookings = filteredBookings.filter(
                          (b) => b.game?.id === col.id
                        );

                        return (
                          <td
                            key={col.id}
                            rowSpan={TIME_SLOTS.length}
                            className="border border-gray-200 bg-white p-0 relative align-top select-none"
                            style={{ height: `${rowHeight * TIME_SLOTS.length}px` }}
                          >
                            {/* Hourly guide lines */}
                            {Array.from({ length: TIME_SLOTS.length - 1 }).map((_, idx) => (
                              <div
                                key={`hour-${idx}`}
                                className="absolute left-0 right-0 border-b border-gray-200 pointer-events-none"
                                style={{ top: `${(idx + 1) * rowHeight}px` }}
                              />
                            ))}

                            {/* 30-minute subdivision lines (dashed, subtle) */}
                            {Array.from({ length: TIME_SLOTS.length }).map((_, idx) => (
                              <div
                                key={`half-${idx}`}
                                className="absolute left-0 right-0 border-b border-dashed border-gray-100 pointer-events-none"
                                style={{ top: `${idx * rowHeight + rowHeight / 2}px` }}
                              />
                            ))}

                            {colBookings.map((b) => {
                              const bStart = new Date(b.startTime);
                              const bMinutes =
                                bStart.getHours() * 60 + bStart.getMinutes();
                              const offsetMinutes = bMinutes - dayStartMinutes;
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
                                  onHover={() => prefetchBooking(b.id)}
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

      {/* Portal — Booking overview modal */}
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