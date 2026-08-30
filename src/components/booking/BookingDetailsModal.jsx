import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Clock,
  User,
  Gamepad2,
  CreditCard,
  RefreshCw,
  Loader2,
  Copy,
  Check,
  Calendar,
  BadgeCheck,
  Timer,
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

const CopyButton = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();

    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard may not be available in some browsers.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied" : "Copy"}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold shrink-0 transition-colors cursor-pointer ${
        copied
          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
          : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-[#532C89]/5 hover:text-[#532C89] hover:border-[#532C89]/20"
      }`}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const SectionHeading = ({ icon: Icon, label, extra }) => {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <Icon size={16} className="text-[#532C89]" />

      <h3 className="text-[13px] font-bold text-gray-700">
        {label}
      </h3>

      <div className="h-px flex-1 bg-gray-100" />

      {extra}
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
          className={`text-sm font-semibold text-gray-800 leading-snug min-w-0 ${
            mono ? "font-mono text-[12px]" : ""
          } ${copy && hasValue ? "select-all" : ""}`}
        >
          {hasValue ? value : "N/A"}
        </span>

        {copy && hasValue && <CopyButton value={value} />}
      </div>
    </div>
  );
};

const StatusBadge = ({ status, type = "booking" }) => {
  const statusKey = (status || "").toUpperCase();

  const styles =
    type === "game"
      ? GAME_STATUS_STYLES
      : STATUS_STYLES;

  const className =
    styles[statusKey] ||
    "bg-gray-50 text-gray-500 border-gray-200";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${className}`}
    >
      {statusKey === "PAID" || statusKey === "COMPLETED" ? (
        <BadgeCheck size={11} />
      ) : statusKey === "IN_PROGRESS" ? (
        <Timer size={11} />
      ) : null}

      {status ? status.replace(/_/g, " ") : "N/A"}
    </span>
  );
};

const PaymentCard = ({ payment, index }) => {
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Payment header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-3.5 bg-gray-50/70 border-b border-gray-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#532C89]/10 flex items-center justify-center shrink-0">
            <CreditCard size={15} className="text-[#532C89]" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800">
              Payment {index + 1}
            </p>

            <p className="text-[11px] text-gray-400 mt-0.5">
              {payment.paymentType || "GAME"}
            </p>
          </div>
        </div>

        <StatusBadge status={payment.status} />
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* Amount and method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">
              Amount Paid
            </span>

            <span className="text-xl font-bold text-gray-900">
              ৳{payment.amount ?? "0"}
            </span>
          </div>

          <Field
            label="Payment Method"
            value={payment.paymentMethod}
          />
        </div>

        {/* Transaction IDs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="min-w-0">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">
              Transaction ID
            </span>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 min-w-0">
              <span className="text-[12px] font-semibold font-mono text-gray-700 truncate flex-1 select-all">
                {payment.transactionId || "N/A"}
              </span>

              {payment.transactionId && (
                <CopyButton value={payment.transactionId} />
              )}
            </div>
          </div>

          <div className="min-w-0">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">
              Customer Order ID
            </span>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 min-w-0">
              <span className="text-[12px] font-semibold font-mono text-gray-700 truncate flex-1 select-all">
                {payment.customerOrderId || "N/A"}
              </span>

              {payment.customerOrderId && (
                <CopyButton value={payment.customerOrderId} />
              )}
            </div>
          </div>
        </div>

        {/* Customer details */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-3">
            Customer Details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field
              label="Name"
              value={payment.customerName}
            />

            <Field
              label="Email"
              value={payment.customerEmail}
              copy
            />

            <Field
              label="Phone"
              value={payment.customerPhone}
              copy
            />
          </div>
        </div>

        {/* Payment dates */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 pt-3 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">
            Created:
            <span className="ml-1.5 font-semibold text-gray-600">
              {formatDate(payment.createdAt)}
            </span>
          </p>

          <p className="text-[11px] text-gray-400">
            Updated:
            <span className="ml-1.5 font-semibold text-gray-600">
              {formatDate(payment.updatedAt)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

const BookingDetailsModal = ({
  bookingId,
  initialData = null,
  onClose,
}) => {
  const axiosSecure = useAxiosSecure();

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
    placeholderData: initialData
      ? { data: { ...initialData } }
      : undefined,
    staleTime: 0,
  });

  if (!bookingId) return null;

  const booking = detailsResponse?.data;
  const user = booking?.user;
  const game = booking?.game;
  const payments = booking?.payments;

  const isEnriching =
    isFetching && !detailsResponse?.data?.payments;

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;

    return `${String(hour12).padStart(2, "0")}:${minutes} ${period}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getBookingTime = () => {
    if (!booking?.startTime) {
      return {
        date: "N/A",
        time: "N/A",
      };
    }

    const start = new Date(booking.startTime);

    const end = new Date(
      start.getTime() +
        (booking.durationMin || 0) * 60000
    );

    return {
      date: start.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: `${formatTime(start)} – ${formatTime(end)}`,
    };
  };

  const bookingTime = getBookingTime();

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/55 backdrop-blur-[3px] p-3 sm:p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col"
        style={{
          maxHeight: "calc(100vh - 32px)",
          animation: "modalIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Booking Details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-7 py-5">
          {isError ? (
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
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <RefreshCw size={13} />
                Retry
              </button>
            </div>
          ) : booking ? (
            <div className="space-y-7">
              {/* Booking information */}
              <section>
                <SectionHeading
                  icon={Calendar}
                  label="Booking Information"
                />

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    <div className="p-4 sm:p-5 space-y-5">
                      <Field
                        label="Booking Date"
                        value={bookingTime.date}
                      />

                      <Field
                        label={`Time Range${
                          booking.durationMin
                            ? ` · ${booking.durationMin} min`
                            : ""
                        }`}
                        value={bookingTime.time}
                      />

                      <Field
                        label="Created On"
                        value={formatDate(booking.createdAt)}
                      />
                    </div>

                    <div className="p-4 sm:p-5 bg-gray-50/60 border-t sm:border-t-0 sm:border-l border-gray-100 space-y-5">
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">
                          Booking Status
                        </span>

                        <StatusBadge status={booking.status} />
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">
                          Game Play Status
                        </span>

                        <StatusBadge
                          status={booking.gameStatus}
                          type="game"
                        />
                      </div>

                      {booking.status === "PENDING" &&
                        booking.expiresAt && (
                          <div>
                            <span className="block text-[10px] font-bold text-red-400 uppercase tracking-[0.08em] mb-1.5">
                              Expires At
                            </span>

                            <span className="text-sm font-semibold text-red-600">
                              {formatDate(booking.expiresAt)}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Customer information */}
              <section>
                <SectionHeading
                  icon={User}
                  label="Customer Information"
                />

                <div className="border border-gray-200 rounded-xl p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={`${user.firstName || ""} ${
                          user.lastName || ""
                        }`}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#532C89]/10 border border-[#532C89]/10 flex items-center justify-center text-[#532C89] text-xl sm:text-2xl font-bold shrink-0">
                        {user?.firstName
                          ? user.firstName[0].toUpperCase()
                          : "?"}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-gray-900 mb-4">
                        {user?.firstName || "N/A"}{" "}
                        {user?.lastName || ""}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>
              </section>

              {/* Game information */}
              <section>
                <SectionHeading
                  icon={Gamepad2}
                  label="Game Information"
                />

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-40 h-36 sm:h-auto shrink-0 bg-gray-100">
                      <ImageCarousel
                        images={game?.images}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <h4 className="text-base sm:text-lg font-bold text-gray-900">
                            {game?.name || "N/A"}
                          </h4>

                          {game?.category?.name && (
                            <p className="text-xs text-gray-400 mt-1">
                              {game.category.name}
                            </p>
                          )}
                        </div>

                        {game?.status && (
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${
                              game.status === "AVAILABLE" ||
                              game.status === "Available"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-600 border-red-200"
                            }`}
                          >
                            {game.status}
                          </span>
                        )}
                      </div>

                      {game?.description && (
                        <p className="text-sm text-gray-500 leading-relaxed mt-3 line-clamp-3">
                          {game.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-gray-100">
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1">
                            30 Minutes
                          </span>

                          <span className="text-base font-bold text-gray-900">
                            ৳{game?.price30Min ?? "N/A"}
                          </span>
                        </div>

                        <div>
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1">
                            60 Minutes
                          </span>

                          <span className="text-base font-bold text-gray-900">
                            ৳{game?.price60Min ?? "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment information */}
              <section>
                <SectionHeading
                  icon={CreditCard}
                  label="Payment Information"
                  extra={
                    isEnriching ? (
                      <Loader2
                        size={14}
                        className="text-gray-400 animate-spin"
                      />
                    ) : null
                  }
                />

                {isEnriching ? (
                  <div className="border border-gray-200 rounded-xl p-5 space-y-3 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                ) : !payments || payments.length === 0 ? (
                  <div className="border border-gray-200 rounded-xl p-7 text-center">
                    <CreditCard
                      size={22}
                      className="mx-auto text-gray-300 mb-2"
                    />

                    <p className="text-sm font-semibold text-gray-500">
                      No payment records found
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      There are no payment transactions associated with this
                      booking.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment, index) => (
                      <PaymentCard
                        key={payment.id || index}
                        payment={payment}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Calendar
                size={24}
                className="mx-auto text-gray-300 mb-2"
              />

              <p className="text-sm font-semibold text-gray-500">
                No booking details found.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 sm:px-7 py-3.5 border-t border-gray-100 bg-gray-50/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#1E293B] hover:bg-[#0f172a] text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer shadow-sm"
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

export default BookingDetailsModal;