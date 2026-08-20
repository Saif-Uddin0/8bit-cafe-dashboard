import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useQuery } from "@tanstack/react-query";
import {
  X, Clock, User, Gamepad2, CreditCard, RefreshCw,
  Loader2, Copy, Check, Calendar, BadgeCheck, Timer,
} from "lucide-react";
import useAxiosSecure from "../../hooks/useAxios";
import ImageCarousel from "../global/ImageCarousel";

// ─── Status palettes ────────────────────────────────────────────────────────
const STATUS_STYLES = {
  PAID:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING:   "bg-amber-50  text-amber-700  border-amber-200",
  COMPLETED: "bg-blue-50   text-blue-700   border-blue-200",
  CANCELLED: "bg-red-50    text-red-600    border-red-200",
  EXPIRED:   "bg-red-50    text-red-600    border-red-200",
};

const GAME_STATUS_STYLES = {
  NOT_STARTED: "bg-gray-100  text-gray-500  border-gray-200",
  IN_PROGRESS: "bg-amber-50  text-amber-700 border-amber-200",
  ENDED:       "bg-blue-50   text-blue-700  border-blue-200",
};

// ─── Inline copy-to-clipboard button ────────────────────────────────────────
const CopyButton = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: select-all works */
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy to clipboard"}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold transition-all cursor-pointer ml-2 shrink-0 border ${
        copied
          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
          : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-[#532C89]/10 hover:text-[#532C89] hover:border-[#532C89]/20"
      }`}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

// ─── Section heading ─────────────────────────────────────────────────────────
const SectionHeading = ({ icon: Icon, label, extra }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-10 h-10 rounded-lg bg-[#532C89]/10 flex items-center justify-center shrink-0">
      <Icon size={17} className="text-[#532C89]" />
    </div>
    <h4 className="text-sm font-bold text-gray-700 tracking-wide">{label}</h4>
    {extra}
  </div>
);

// ─── Field row ───────────────────────────────────────────────────────────────
const Field = ({ label, value, mono, copy }) => (
  <div>
    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
      {label}
    </span>
    <div className="flex items-center flex-wrap gap-1">
      <span
        className={`text-sm font-bold text-gray-800 leading-snug ${mono ? "font-mono" : ""} ${copy ? "select-all" : ""}`}
      >
        {value || "—"}
      </span>
      {copy && value && <CopyButton value={value} />}
    </div>
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────
const BookingDetailsModal = ({ bookingId, initialData = null, onClose }) => {
  const axiosSecure = useAxiosSecure();

  // Scroll-lock + Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Fetch full details; seed immediately from list-row data (no spinner)
  const { data: detailsResponse, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["bookingDetails", bookingId],
    queryFn: async () => {
      const res = await axiosSecure.get(`/api/booking/booking-details/${bookingId}`);
      return res.data;
    },
    enabled: !!bookingId,
    placeholderData: initialData
      ? { data: { ...initialData } }
      : undefined,
    staleTime: 0,
  });

  if (!bookingId) return null;

  const booking  = detailsResponse?.data;
  const user     = booking?.user;
  const game     = booking?.game;
  const payments = booking?.payments;
  const isEnriching = isFetching && !detailsResponse?.data?.payments;

  // ── Time helpers ────────────────────────────────────────────────────────
  const fmt = (d) => {
    let h = d.getHours(), m = String(d.getMinutes()).padStart(2, "0");
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h).padStart(2, "0")}:${m} ${ap}`;
  };

  const { dateStr, timeRange } = (() => {
    if (!booking?.startTime) return { dateStr: "—", timeRange: "—" };
    const s = new Date(booking.startTime);
    const e = new Date(s.getTime() + (booking.durationMin || 0) * 60000);
    return {
      dateStr: s.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      timeRange: `${fmt(s)} – ${fmt(e)}`,
    };
  })();

  // ── Booking status badge ────────────────────────────────────────────────
  const statusKey = (booking?.status || "").toUpperCase();
  const statusCls = STATUS_STYLES[statusKey] || "bg-gray-100 text-gray-500 border-gray-200";
  const gameStatusKey = (booking?.gameStatus || "").toUpperCase();
  const gameStatusCls = GAME_STATUS_STYLES[gameStatusKey] || "bg-gray-100 text-gray-500 border-gray-200";

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: "calc(100vh - 24px)", animation: "modalIn 0.2s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">Booking Details</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer shrink-0 mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {isError ? (
            <div className="p-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl space-y-3">
              <p className="text-sm font-semibold">Failed to load booking details: {error?.message || "Unknown error"}</p>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 rounded-xl text-sm font-bold text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
              >
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          ) : booking ? (
            <>
              {/* ── 1. Booking Information ─────────────────────────────── */}
              <section>
                <SectionHeading icon={Calendar} label="Booking Information" />
                <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Left column */}
                  <div className="space-y-4">
                    <Field label="Booking Date" value={dateStr} />
                    <Field label={`Time Range · ${booking.durationMin ? booking.durationMin + " min" : ""}`} value={timeRange} />
                    <Field
                      label="Created On"
                      value={booking.createdAt
                        ? new Date(booking.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
                        : "—"}
                    />
                  </div>
                  {/* Right column */}
                  <div className="space-y-4">
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Booking Status
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusCls}`}>
                        <BadgeCheck size={12} />
                        {booking.status || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Game Play Status
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${gameStatusCls}`}>
                        <Timer size={12} />
                        {booking.gameStatus?.replace(/_/g, " ") || "—"}
                      </span>
                    </div>
                    {booking.status === "PENDING" && booking.expiresAt && (
                      <div>
                        <span className="block text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
                          Expires At
                        </span>
                        <span className="text-sm font-bold text-red-600">
                          {new Date(booking.expiresAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* ── 2. Customer Information ─────────────────────────────── */}
              <section>
                <SectionHeading icon={User} label="Customer Information" />
                <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex items-center gap-5">
                  {/* Avatar */}
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={`${user.firstName || ""} ${user.lastName || ""}`}
                      className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#532C89]/10 flex items-center justify-center text-[#532C89] font-bold text-2xl border border-[#532C89]/10 shrink-0">
                      {user?.firstName ? user.firstName[0].toUpperCase() : "?"}
                    </div>
                  )}
                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-base font-bold text-gray-900 leading-tight">
                      {user?.firstName || "—"} {user?.lastName || ""}
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-700 select-all">{user?.phone || "No phone"}</span>
                        <span className="text-gray-300 mx-2">·</span>
                        <span className="font-semibold text-gray-700 select-all">{user?.email || "No email"}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── 3. Game Information ─────────────────────────────────── */}
              <section>
                <SectionHeading icon={Gamepad2} label="Game Information" />
                <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col sm:flex-row gap-5">
                  {/* Game thumbnail */}
                  <div className="w-full sm:w-36 h-32 shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-100">
                    <ImageCarousel images={game?.images} className="w-full h-full object-cover" />
                  </div>
                  {/* Game details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h5 className="text-base font-bold text-gray-900">{game?.name || "—"}</h5>
                        {game?.category?.name && (
                          <span className="text-xs font-bold bg-purple-50 text-purple-600 px-2.5 py-0.5 rounded-full border border-purple-100">
                            {game.category.name}
                          </span>
                        )}
                        {game?.status && (
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            game.status === "AVAILABLE" || game.status === "Available"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-600 border-red-100"
                          }`}>
                            {game.status}
                          </span>
                        )}
                      </div>
                      {game?.description && (
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{game.description}</p>
                      )}
                    </div>
                    <div className="flex gap-8 mt-4 pt-3 border-t border-dashed border-gray-200">
                      <div>
                        <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Price / 30 Min</span>
                        <span className="text-base font-bold text-gray-900">৳{game?.price30Min ?? "—"}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Price / 60 Min</span>
                        <span className="text-base font-bold text-gray-900">৳{game?.price60Min ?? "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── 4. Payment Information ──────────────────────────────── */}
              <section>
                <SectionHeading
                  icon={CreditCard}
                  label="Payment Information"
                  extra={isEnriching && <Loader2 size={13} className="text-gray-300 animate-spin ml-1" />}
                />

                {isEnriching ? (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 space-y-3 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
                    <div className="h-4 bg-gray-100 rounded-lg w-2/3" />
                    <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
                  </div>
                ) : !payments || payments.length === 0 ? (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-6 text-center text-sm text-gray-400">
                    No payment records found for this booking.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((p, idx) => (
                      <div key={p.id || idx} className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 space-y-4">

                        {/* Payment header */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                            Payment 
                            <span className="text-xs font-semibold text-gray-400 ml-2 normal-case tracking-normal">
                              ({p.paymentType || "GAME"})
                            </span>
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            p.status === "SUCCESS"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-600 border-red-200"
                          }`}>
                            {p.status}
                          </span>
                        </div>

                        {/* Amount + Method */}
                        <div className="grid grid-cols-2 gap-5 pb-4 border-b border-gray-100">
                          <Field label="Amount Paid" value={`৳${p.amount || "0"}`} />
                          <Field label="Payment Method" value={p.paymentMethod} />
                        </div>

                        {/* Transaction ID + Order ID — prominent copy */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                              Transaction ID
                            </span>
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
                              <span className="text-sm font-bold font-mono text-gray-800 select-all truncate flex-1">
                                {p.transactionId || "—"}
                              </span>
                              {p.transactionId && <CopyButton value={p.transactionId} />}
                            </div>
                          </div>
                          <div>
                            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                              Order ID
                            </span>
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
                              <span className="text-sm font-bold font-mono text-gray-800 select-all truncate flex-1">
                                {p.customerOrderId || "—"}
                              </span>
                              {p.customerOrderId && <CopyButton value={p.customerOrderId} />}
                            </div>
                          </div>
                        </div>

                        {/* Customer details at payment */}
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Customer Details (Provided at Payment)
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field label="Name"  value={p.customerName} />
                            <Field label="Email" value={p.customerEmail} copy />
                            <Field label="Phone" value={p.customerPhone} copy />
                          </div>
                        </div>

                        {/* Timestamps */}
                        <div className="pt-2 border-t border-gray-100/70 flex flex-wrap gap-4 text-xs text-gray-400">
                          <span>Paid At: <span className="font-semibold text-gray-500">{p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}</span></span>
                          <span>Updated: <span className="font-semibold text-gray-500">{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "—"}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <div className="py-12 text-center text-sm text-gray-400">No booking details found.</div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#1E293B] hover:bg-[#0f172a] text-white rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default BookingDetailsModal;
