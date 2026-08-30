import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Calendar,
  Clock,
  User,
  Gamepad2,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import useAxiosSecure from "../../hooks/useAxios";
import ImageCarousel from "../global/ImageCarousel";

const STATUS_STYLES = {
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
  EXPIRED: "bg-red-50 text-red-600 border-red-200",
};

const GAME_STATUS_STYLES = {
  NOT_STARTED: "bg-gray-50 text-gray-600 border-gray-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  ENDED: "bg-blue-50 text-blue-700 border-blue-200",
};

const CopyButton = ({ value, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();

    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard access failed.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : `Copy ${label}`}
      className={`
        inline-flex items-center justify-center
        w-7 h-7
        rounded-md
        border
        transition-all
        cursor-pointer
        shrink-0
        ${
          copied
            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
            : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-[#532C89]/5 hover:text-[#532C89] hover:border-[#532C89]/20"
        }
      `}
    >
      {copied ? (
        <Check size={12} strokeWidth={2.5} />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );
};

const SectionHeader = ({ icon: Icon, label }) => {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-lg bg-[#532C89]/8 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-[#532C89]" />
      </div>

      <h3 className="text-[13px] font-bold text-gray-700">
        {label}
      </h3>

      <div className="h-px flex-1 bg-gray-100" />
    </div>
  );
};

const Field = ({ label, value, mono = false, copy = false }) => {
  const hasValue =
    value !== null &&
    value !== undefined &&
    value !== "" &&
    value !== "—";

  return (
    <div className="min-w-0">
      <span className="block text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">
        {label}
      </span>

      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`
            min-w-0
            text-sm
            font-semibold
            text-gray-800
            leading-snug
            ${mono ? "font-mono text-[12px]" : ""}
            ${copy && hasValue ? "select-all" : ""}
          `}
        >
          {hasValue ? value : "N/A"}
        </span>

        {copy && hasValue && (
          <CopyButton value={value} label={label.toLowerCase()} />
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ value, styles }) => {
  const key = (value || "").toUpperCase();

  return (
    <span
      className={`
        inline-flex items-center
        px-2.5 py-1
        rounded-full
        border
        text-[10px]
        font-bold
        uppercase
        tracking-wide
        ${styles[key] || "bg-gray-50 text-gray-500 border-gray-200"}
      `}
    >
      {value || "N/A"}
    </span>
  );
};

const CalendarBookingModal = ({ bookingId, onClose }) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const {
    data: detailsResponse,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["bookingDetails", bookingId],

    queryFn: async () => {
      const res = await axiosSecure.get(
        `/api/booking/booking-details/${bookingId}`
      );

      return res.data;
    },

    enabled: !!bookingId,

    staleTime: 60 * 1000,

    placeholderData: () => {
      const list = queryClient.getQueryData(["bookings"]) ?? [];
      const match = list.find?.((booking) => booking.id === bookingId);

      if (!match) return undefined;

      return {
        data: match,
      };
    },
  });

  if (!bookingId) return null;

  const booking = detailsResponse?.data;
  const user = booking?.user;
  const game = booking?.game;

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const getBookingTimes = () => {
    if (!booking?.startTime) {
      return {
        dateStr: "—",
        startStr: "—",
        endStr: "—",
      };
    }

    const start = new Date(booking.startTime);

    const end = new Date(
      start.getTime() + (booking.durationMin || 0) * 60 * 1000
    );

    return {
      dateStr: start.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),

      startStr: formatTime(start),
      endStr: formatTime(end),
    };
  };

  const { dateStr, startStr, endStr } = getBookingTimes();

  const shortId = booking?.id
    ? `#${booking.id.replace(/-/g, "").slice(-8).toUpperCase()}`
    : "—";

  const bookingStatus =
    (booking?.status || "").toUpperCase();

  const gameStatus =
    (booking?.gameStatus || "").toUpperCase();

  const isLoadingDetails = isFetching && !detailsResponse;

  return ReactDOM.createPortal(
    <div
      className="
        fixed inset-0 z-[999]
        flex items-center justify-center
        bg-black/55
        backdrop-blur-[3px]
        p-3 sm:p-5
      "
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          relative
          w-full
          max-w-3xl
          bg-white
          rounded-2xl
          shadow-[0_20px_60px_rgba(0,0,0,0.18)]
          overflow-hidden
          flex flex-col
        "
        style={{
          maxHeight: "calc(100vh - 32px)",
          animation: "modalIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="
            flex items-center justify-between
            px-5 sm:px-7
            py-4
            border-b border-gray-100
            shrink-0
          "
        >
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Booking Details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              w-9 h-9
              rounded-lg
              flex items-center justify-center
              text-gray-400
              hover:text-gray-700
              hover:bg-gray-100
              transition-all
              cursor-pointer
              shrink-0
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div
          className="
            overflow-y-auto
            flex-1
            px-5 sm:px-7
            py-5
            space-y-7
          "
        >
          {isLoadingDetails ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-9 h-9 border-[3px] border-[#532C89] border-t-transparent rounded-full animate-spin" />

              <p className="text-xs font-semibold text-gray-400 mt-3">
                Loading booking details...
              </p>
            </div>
          ) : isError ? (
            <div className="p-5 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm font-semibold text-red-700">
                Failed to load booking details.
              </p>

              <p className="text-xs text-red-500 mt-1">
                {error?.message || "Something went wrong."}
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                className="
                  inline-flex items-center gap-1.5
                  mt-4
                  px-4 py-2
                  bg-white
                  border border-red-200
                  rounded-lg
                  text-xs
                  font-bold
                  text-red-700
                  hover:bg-red-50
                  transition-colors
                  cursor-pointer
                "
              >
                <RefreshCw size={13} />
                Retry
              </button>
            </div>
          ) : booking ? (
            <>
              {/* Customer Information */}
              <section>
                <SectionHeader
                  icon={User}
                  label="Customer Information"
                />

                <div
                  className="
                    flex flex-col sm:flex-row
                    sm:items-center
                    gap-4
                    p-4
                    rounded-xl
                    bg-gray-50/70
                    border border-gray-100
                  "
                >
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={`${user.firstName || ""} ${user.lastName || ""}`}
                      className="
                        w-14 h-14
                        rounded-xl
                        object-cover
                        border border-gray-200
                        shrink-0
                      "
                    />
                  ) : (
                    <div
                      className="
                        w-14 h-14
                        rounded-xl
                        bg-[#532C89]/10
                        border border-[#532C89]/10
                        flex items-center justify-center
                        text-[#532C89]
                        text-xl
                        font-bold
                        shrink-0
                      "
                    >
                      {user?.firstName
                        ? user.firstName[0].toUpperCase()
                        : "?"}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-gray-900">
                      {user?.firstName || "Guest"}{" "}
                      {user?.lastName || ""}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <Field
                        label="Email"
                        value={user?.email}
                        copy
                      />

                      <Field
                        label="Phone"
                        value={user?.phone}
                        copy
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Booking Information */}
              <section>
                <SectionHeader
                  icon={Calendar}
                  label="Booking Information"
                />

                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    <div className="p-4">
                      <Field
                        label="Booking ID"
                        value={shortId}
                        mono
                        copy={!!booking.id}
                      />
                    </div>

                    <div className="p-4 sm:border-l border-gray-100">
                      <Field
                        label="Booking Date"
                        value={dateStr}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 border-t border-gray-100">
                    <div className="p-4">
                      <Field
                        label="Start Time"
                        value={startStr}
                      />
                    </div>

                    <div className="p-4 border-l border-gray-100">
                      <Field
                        label="End Time"
                        value={endStr}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-gray-100">
                    <div className="p-4">
                      <Field
                        label="Duration"
                        value={
                          booking.durationMin
                            ? `${booking.durationMin} min`
                            : null
                        }
                      />
                    </div>

                    <div className="p-4 border-l border-gray-100">
                      <Field
                        label="Amount"
                        value={`৳${booking.totalAmount ?? "0"}`}
                      />
                    </div>

                    <div className="p-4 border-t sm:border-t-0 sm:border-l border-gray-100">
                      <span className="block text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">
                        Booking Status
                      </span>

                      <StatusBadge
                        value={bookingStatus}
                        styles={STATUS_STYLES}
                      />
                    </div>

                    <div className="p-4 border-l border-gray-100">
                      <span className="block text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">
                        Game Status
                      </span>

                      <StatusBadge
                        value={gameStatus.replace(/_/g, " ")}
                        styles={GAME_STATUS_STYLES}
                      />
                    </div>
                  </div>
                </div>

                {bookingStatus === "PENDING" && booking.expiresAt && (
                  <div className="mt-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.08em]">
                        Payment / Booking Expires
                      </span>

                      <span className="text-xs font-semibold text-amber-700">
                        {new Date(
                          booking.expiresAt
                        ).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </section>

              {/* Game Information */}
              <section>
                <SectionHeader
                  icon={Gamepad2}
                  label="Game Information"
                />

                <div
                  className="
                    flex flex-col sm:flex-row
                    gap-5
                    p-4
                    rounded-xl
                    bg-gray-50/70
                    border border-gray-100
                  "
                >
                  <div
                    className="
                      w-full
                      sm:w-40
                      h-32
                      shrink-0
                      rounded-xl
                      overflow-hidden
                      border border-gray-200
                      bg-gray-100
                    "
                  >
                    <ImageCarousel
                      images={game?.images}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-base font-bold text-gray-900 truncate">
                          {game?.name || "N/A"}
                        </h4>

                        {game?.category?.name && (
                          <p className="text-xs text-gray-400 mt-1">
                            {game.category.name}
                          </p>
                        )}
                      </div>

                      {game?.status && (
                        <StatusBadge
                          value={game.status}
                          styles={{
                            AVAILABLE:
                              "bg-emerald-50 text-emerald-700 border-emerald-200",
                            UNAVAILABLE:
                              "bg-red-50 text-red-600 border-red-200",
                          }}
                        />
                      )}
                    </div>

                    {game?.description && (
                      <p className="text-sm text-gray-500 leading-relaxed mt-3 line-clamp-2">
                        {game.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-5 mt-5 pt-4 border-t border-gray-200/80">
                      <Field
                        label="Price / 30 Min"
                        value={`৳${game?.price30Min ?? "—"}`}
                      />

                      <Field
                        label="Price / 60 Min"
                        value={`৳${game?.price60Min ?? "—"}`}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Created Information */}
              <section>
                <SectionHeader
                  icon={Clock}
                  label="Booking Timeline"
                />

                <div className="border border-gray-100 rounded-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    <div className="p-4">
                      <Field
                        label="Created On"
                        value={
                          booking.createdAt
                            ? new Date(
                                booking.createdAt
                              ).toLocaleString("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : null
                        }
                      />
                    </div>

                    <div className="p-4 sm:border-l border-gray-100">
                      <Field
                        label="Duration"
                        value={
                          booking.durationMin
                            ? `${booking.durationMin} minutes`
                            : null
                        }
                      />
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-gray-500">
                No booking details found.
              </p>

              <p className="text-xs text-gray-400 mt-1">
                The requested booking could not be loaded.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="
            flex items-center justify-end
            px-5 sm:px-7
            py-3.5
            border-t border-gray-100
            bg-gray-50/50
            shrink-0
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              px-5
              py-2.5
              bg-[#1E293B]
              hover:bg-[#0f172a]
              text-white
              rounded-lg
              text-sm
              font-semibold
              transition-all
              cursor-pointer
              shadow-sm
            "
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.97) translateY(8px);
          }

          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default CalendarBookingModal;