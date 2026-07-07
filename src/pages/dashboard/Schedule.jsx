import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TableScrollWrapper from "../../components/global/TableScrollWrapper";
// CONSTANTS & GAME STATIONS

// Time slots displayed on the left axis matching the Figma screenshot
const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
];

// Game stations shown as columns with exact background and text colors matching Figma
const GAME_STATIONS = [
  { id: "fifa_1", name: "Fifa", bgClass: "bg-[#CBEFFF]", textClass: "text-[#1E293B]" },
  { id: "pool_1", name: "Pool", bgClass: "bg-[#EEDBFF]", textClass: "text-[#1E293B]" },
  { id: "fifa_2", name: "Fifa", bgClass: "bg-[#FFEED6]", textClass: "text-[#1E293B]" },
  { id: "fifa_3", name: "Fifa", bgClass: "bg-[#FFD6D6]", textClass: "text-[#1E293B]" },
  { id: "fifa_4", name: "Fifa", bgClass: "bg-[#D2E3FF]", textClass: "text-[#1E293B]" },
];


// MOCK BOOKINGS DATA (Returns exact layout of Figma for any day selected)

const getBookingsForDate = () => {
  const key = (stationId, time) => `${stationId}|${time}`;
  return {
    [key("pool_1", "09:00 AM")]: { name: "John Smith", phone: "012345678912" },
    [key("fifa_3", "09:00 AM")]: { name: "John Smith", phone: "012345678912" },
    
    [key("fifa_1", "10:00 AM")]: { name: "John Smith", phone: "012345678912" },
    [key("fifa_2", "10:00 AM")]: { name: "John Smith", phone: "012345678912" },
    [key("fifa_3", "10:00 AM")]: { name: "John Smith", phone: "012345678912" },
    [key("fifa_4", "10:00 AM")]: { name: "John Smith", phone: "012345678912" },
    
    [key("fifa_1", "11:00 AM")]: { name: "John Smith", phone: "012345678912" },
    
    [key("pool_1", "12:00 PM")]: { name: "John Smith", phone: "012345678912" },
    [key("fifa_2", "12:00 PM")]: { name: "John Smith", phone: "012345678913" },
    [key("fifa_4", "12:00 PM")]: { name: "John Smith", phone: "012345678912" },
    
    [key("fifa_4", "01:00 PM")]: { name: "John Smith", phone: "012345678912" },
    
    [key("fifa_2", "02:00 PM")]: { name: "John Smith", phone: "012345678912" },
  };
};

// Helper to format date display in the card header, e.g. "Monday, Jun 22"
const formatHeaderDate = (date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

// BOOKING CARD COMPONENT (Centered text, matching background color, rounded)
const BookingCard = ({ booking, bgClass }) => (
  <div className={`${bgClass} rounded-[10px] py-2 px-3 text-center transition-all hover:opacity-90`}>
    <p className="font-bold text-[#1E293B] text-xs sm:text-sm lg:text-[15px] leading-tight truncate">
      {booking.name}
    </p>
    <p className="text-[#4B5563] text-[10px] sm:text-xs lg:text-[13px] mt-1.5 select-all font-medium leading-none">
      {booking.phone}
    </p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCHEDULE COMPONENT
const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const bookings = getBookingsForDate();

  const handlePrevDay = () => {
    setCurrentDate((prev) => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
  };

  const handleNextDay = () => {
    setCurrentDate((prev) => new Date(prev.getTime() + 24 * 60 * 60 * 1000));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

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
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={handleToday}
              className="bg-[#007AFF] text-white hover:bg-blue-600 font-semibold px-6 py-1.5 rounded-lg text-sm transition-colors shadow-sm"
            >
              Today
            </button>

            <button
              onClick={handleNextDay}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Reusable Scroll Wrapper for professional mobile responsiveness */}
        <TableScrollWrapper minWidth="900px">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr>
                {/* TIME column header */}
                <th className="border border-gray-200 bg-gray-50 text-center py-4 text-xs sm:text-sm lg:text-base font-bold text-[#1E293B] uppercase tracking-wider w-28 select-none">
                  TIME
                </th>

                {/* Game station headers */}
                {GAME_STATIONS.map((station) => (
                  <th
                    key={station.id}
                    className={`border border-gray-200 ${station.bgClass} ${station.textClass} text-center py-4 text-sm sm:text-base lg:text-lg font-bold tracking-wide w-48`}
                  >
                    {station.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {TIME_SLOTS.map((time) => (
                <tr key={time}>
                  {/* Time label cell */}
                  <td className="border border-gray-200 bg-white text-center py-5 text-xs sm:text-sm lg:text-base font-semibold text-[#1E293B] select-none">
                    {time}
                  </td>

                  {/* Game station slots */}
                  {GAME_STATIONS.map((station) => {
                    const bookingKey = `${station.id}|${time}`;
                    const booking = bookings[bookingKey];

                    return (
                      <td
                        key={station.id}
                        className="border border-gray-200 bg-white p-2.5 h-[84px] lg:h-[96px] align-middle"
                      >
                        {booking ? (
                          <BookingCard booking={booking} bgClass={station.bgClass} />
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </TableScrollWrapper>

      </div>
    </div>
  );
};

export default Schedule;