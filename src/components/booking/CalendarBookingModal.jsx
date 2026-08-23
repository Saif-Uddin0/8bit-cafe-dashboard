import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Calendar,
  Clock,
  User,
  Gamepad,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import useAxiosSecure from "../../hooks/useAxios";
import ImageCarousel from "../global/ImageCarousel";

// ── Status badge styles (matching existing dashboard conventions) ──────────────
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

// ── Small inline copy button ──────────────────────────────────────────────────
// Shows a Copy icon; after clicking, switches to a green Check for 1.5 s then resets.
const CopyButton = ({ value, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!value) return;
    navigator.clipboard.writeText(String(value)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      title={`Copy ${label}`}
      className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-all cursor-pointer shrink-0 ${
        copied
          ? "text-green-600 bg-green-50 border border-green-200"
          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 border border-transparent"
      }`}
    >
      {copied ? <Check size={11} strokeWidth={2.5} /> : <Copy size={11} />}
    </button>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────
const CalendarBookingModal = ({ bookingId, onClose }) => {
  const axiosSecure = useAxiosSecure();

  // Scroll lock & Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Query booking details.
  // • staleTime: 60 s — if the card was hovered the data is already in cache; no spinner.
  // • placeholderData: pull partial info from the bookings list so the modal is
  //   never completely empty while the full detail response arrives.
  const queryClient = useQueryClient();
  const {
    data: detailsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["bookingDetails", bookingId],
    queryFn: async () => {
      const res = await axiosSecure.get(`/api/booking/booking-details/${bookingId}`);
      return res.data;
    },
    enabled: !!bookingId,
    staleTime: 60 * 1000,          // data prefetched on hover is fresh for 60 s
    placeholderData: () => {
      // Attempt to build a minimal placeholder from the already-loaded bookings list
      const list = queryClient.getQueryData(["bookings"]) ?? [];
      const match = list.find?.((b) => b.id === bookingId);
      if (!match) return undefined;
      // Wrap in the same shape the detail API returns so the UI renders immediately
      return { data: match };
    },
  });

  if (!bookingId) return null;

  const booking = detailsResponse?.data;
  const user    = booking?.user;
  const game    = booking?.game;

  // ── Time helpers ─────────────────────────────────────────────────────────────
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const getBookingTimes = () => {
    if (!booking?.startTime) return { dateStr: "—", startStr: "—", endStr: "—" };
    const start = new Date(booking.startTime);
    const end   = new Date(start.getTime() + (booking.durationMin || 0) * 60 * 1000);
    const dateStr = start.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return { dateStr, startStr: formatTime(start), endStr: formatTime(end) };
  };

  const { dateStr, startStr, endStr } = getBookingTimes();

  // Shorten the booking ID for display: "#" + last 8 characters of the UUID
  const shortId = booking?.id
    ? `#${booking.id.replace(/-/g, "").slice(-8).toUpperCase()}`
    : "—";

  // ── Render ────────────────────────────────────────────────────────────────────
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
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-none">Booking Overview</h2>
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

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
          {/* Show spinner only on a true cold load — prefetched/placeholder data skips this */}
          {isFetching && !detailsResponse ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-[3px] border-[#532C89] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400 font-semibold">Loading details...</p>
            </div>
          ) : isError ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl space-y-3">
              <p className="text-sm font-semibold">
                Failed to load details: {error?.message || "Unknown error"}
              </p>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 rounded-lg text-xs font-bold text-red-700 hover:bg-red-50 cursor-pointer"
              >
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          ) : booking ? (
            <>
              {/* ── Customer Information ── */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <User size={13} className="text-[#532C89]" />
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Customer Information
                  </h4>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                  {/* Avatar */}
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={`${user.firstName || ""} ${user.lastName || ""}`}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-[#532C89] font-extrabold text-base border border-purple-100 shrink-0">
                      {user?.firstName ? user.firstName[0].toUpperCase() : "?"}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Name */}
                    <p className="text-[14px] font-bold text-gray-900 leading-tight truncate">
                      {user?.firstName || "—"} {user?.lastName || ""}
                    </p>

                    {/* Phone + copy */}
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] font-semibold text-gray-700 select-all truncate leading-none">
                        {user?.phone || "No phone number"}
                      </p>
                      {user?.phone && (
                        <CopyButton value={user.phone} label="phone number" />
                      )}
                    </div>

                    {/* Email + copy */}
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] text-gray-500 select-all truncate leading-none">
                        {user?.email || "No email"}
                      </p>
                      {user?.email && (
                        <CopyButton value={user.email} label="email" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Game Information ── */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Gamepad size={13} className="text-[#532C89]" />
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Game Information
                  </h4>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                  {/* Game image / carousel */}
                  <div className="w-full sm:w-28 h-24 shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                    <ImageCarousel images={game?.images} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-[14px] font-bold text-gray-900 truncate leading-tight">
                          {game?.name || "—"}
                        </h5>
                        {game?.category?.name && (
                          <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100">
                            {game.category.name}
                          </span>
                        )}
                        {game?.status && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              game.status === "AVAILABLE" || game.status === "Available"
                                ? "bg-green-50 text-green-700 border-green-100"
                                : "bg-red-50 text-red-600 border-red-100"
                            }`}
                          >
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
                    <div className="flex gap-4 mt-2.5 pt-2.5 border-t border-dashed border-gray-200">
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase leading-none tracking-wider">30 Min</p>
                        <p className="text-[13px] font-bold text-gray-800 mt-1">৳{game?.price30Min ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase leading-none tracking-wider">60 Min</p>
                        <p className="text-[13px] font-bold text-gray-800 mt-1">৳{game?.price60Min ?? "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Booking Summary ── */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Clock size={13} className="text-[#532C89]" />
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Booking Summary
                  </h4>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 space-y-3">

                  {/* Row 1: Booking ID + Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Booking ID</p>
                      <div className="flex items-center gap-1.5">
                        <p className="font-mono font-bold text-[13px] text-[#532C89] tracking-wide">{shortId}</p>
                        <CopyButton value={booking.id} label="booking ID" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Booking Date</p>
                      <p className="text-[11px] font-semibold text-gray-700 leading-snug">{dateStr}</p>
                    </div>
                  </div>

                  {/* Row 2: Start Time + End Time */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200/60">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Start Time</p>
                      <p className="text-[13px] font-bold text-gray-800">{startStr}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">End Time</p>
                      <p className="text-[13px] font-bold text-gray-800">{endStr}</p>
                    </div>
                  </div>

                  {/* Row 3: Duration + Total Amount */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200/60">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Duration</p>
                      <p className="text-[13px] font-bold text-gray-800">{booking.durationMin} min</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Total Amount</p>
                      <p className="text-[16px] font-extrabold text-[#532C89]">৳{booking.totalAmount || "0"}</p>
                    </div>
                  </div>

                  {/* Row 4: Booking Status + Game Play Status */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200/60">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Booking Status</p>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Game Play Status</p>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          GAME_STATUS_STYLES[booking.gameStatus] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {booking.gameStatus?.replace(/_/g, " ") || "—"}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">
              No booking details found.
            </div>
          )}
        </div>

        {/* ── Footer ── */}
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
