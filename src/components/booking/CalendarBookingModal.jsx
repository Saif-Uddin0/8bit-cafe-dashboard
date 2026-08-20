import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { X, Calendar, Clock, User, Gamepad, DollarSign, RefreshCw } from "lucide-react";
import useAxiosSecure from "../../hooks/useAxios";
import ImageCarousel from "../global/ImageCarousel";

// Status badge styles matching existing conventions
const STATUS_STYLES = {
  PAID:      "bg-green-100 text-green-700",
  PENDING:   "bg-amber-100 text-amber-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
  EXPIRED:   "bg-red-100 text-red-700",
};

const GAME_STATUS_STYLES = {
  NOT_STARTED: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  ENDED:       "bg-blue-100 text-blue-700",
};

const CalendarBookingModal = ({ bookingId, onClose }) => {
  const axiosSecure = useAxiosSecure();

  // Scroll lock & Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Query details only when booking ID is selected
  const { data: detailsResponse, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["bookingDetails", bookingId],
    queryFn: async () => {
      const res = await axiosSecure.get(`/api/booking/booking-details/${bookingId}`);
      return res.data;
    },
    enabled: !!bookingId,
  });

  if (!bookingId) return null;

  const booking = detailsResponse?.data;
  const user = booking?.user;
  const game = booking?.game;

  // Local helper to format times
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const getBookingTimes = () => {
    if (!booking?.startTime) return { dateStr: "—", timeRange: "—" };
    const start = new Date(booking.startTime);
    const end = new Date(start.getTime() + (booking.durationMin || 0) * 60 * 1000);
    const dateStr = start.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return {
      dateStr,
      timeRange: `${formatTime(start)} - ${formatTime(end)}`,
    };
  };

  const { dateStr, timeRange } = getBookingTimes();

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col"
        style={{ maxHeight: "calc(100vh - 24px)", animation: "modalIn 0.2s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#532C89]/10 flex items-center justify-center">
              <Calendar size={16} className="text-[#532C89]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-none">Booking Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">Quick Summary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-3 border-[#532C89] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-gray-400 font-semibold">Loading details...</p>
            </div>
          ) : isError ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl space-y-3">
              <p className="text-sm font-semibold">Failed to load details: {error?.message || "Unknown error"}</p>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 rounded-lg text-xs font-bold text-red-700 hover:bg-red-50 cursor-pointer"
              >
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          ) : booking ? (
            <>
              {/* Customer Info Card */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <User size={14} className="text-[#532C89]" />
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Information</h4>
                </div>
                <div className="flex items-center gap-4 bg-gray-50/50 border border-gray-100 rounded-xl p-3.5">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={`${user.firstName || ""} ${user.lastName || ""}`}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-[#532C89] font-extrabold text-lg border border-purple-100">
                      {user?.firstName ? user.firstName[0].toUpperCase() : "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 leading-tight">
                      {user?.firstName || "—"} {user?.lastName || ""}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 select-all">{user?.phone || "No phone number"}</p>
                    <p className="text-xs text-gray-400 mt-0.5 select-all">{user?.email || "No email"}</p>
                  </div>
                </div>
              </div>

              {/* Game Info Card */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Gamepad size={14} className="text-[#532C89]" />
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Game Information</h4>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 bg-gray-50/50 border border-gray-100 rounded-xl p-3.5">
                  <div className="w-full sm:w-28 h-24 shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                    <ImageCarousel images={game?.images} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-sm font-bold text-gray-900 truncate leading-tight">{game?.name || "—"}</h5>
                        {game?.category?.name && (
                          <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100">
                            {game.category.name}
                          </span>
                        )}
                        {game?.status && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            game.status === "AVAILABLE" || game.status === "Available" ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                          }`}>
                            {game.status}
                          </span>
                        )}
                      </div>
                      {game?.description && (
                        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2">
                          {game.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-4 mt-2.5 pt-2 border-t border-dashed border-gray-100">
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase leading-none">30 Min</p>
                        <p className="text-xs font-bold text-gray-800 mt-1">৳{game?.price30Min ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase leading-none">60 Min</p>
                        <p className="text-xs font-bold text-gray-800 mt-1">৳{game?.price60Min ?? "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Summary Section */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock size={14} className="text-[#532C89]" />
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Booking Summary</h4>
                </div>
                <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3.5 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400">Booking Date</p>
                      <p className="font-semibold text-gray-700 mt-0.5">{dateStr}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Time / Duration</p>
                      <p className="font-semibold text-gray-700 mt-0.5">
                        {timeRange} ({booking.durationMin} min)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-gray-100 text-xs">
                    <div>
                      <p className="text-gray-400">Booking Status</p>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 ${STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-600"}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-400">Game Play Status</p>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 ${GAME_STATUS_STYLES[booking.gameStatus] || "bg-gray-100 text-gray-600"}`}>
                        {booking.gameStatus?.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2.5 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Amount</p>
                    <p className="text-base font-extrabold text-[#532C89] flex items-center">
                      ৳{booking.totalAmount || "0"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">No booking details found.</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-800 transition-all cursor-pointer shadow-sm"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default CalendarBookingModal;
