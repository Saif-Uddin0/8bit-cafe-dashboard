import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  X,
  User,
  CreditCard,
  Receipt,
  Copy,
  Check,
} from "lucide-react";

// Status Styles

const STATUS_STYLES = {
  SUCCESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
  FAILED: "bg-red-50 text-red-600 border-red-200",
};


// Copy Button
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
      // Ignore clipboard error
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy to clipboard"}
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1
        rounded-md
        border
        text-[11px]
        font-semibold
        transition-all
        shrink-0
        cursor-pointer
        ${
          copied
            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
            : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-[#532C89]/5 hover:text-[#532C89] hover:border-[#532C89]/20"
        }
      `}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};


// Simple Field
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
            text-sm font-semibold text-gray-800
            leading-snug
            min-w-0
            ${mono ? "font-mono text-[12px]" : ""}
            ${copy && hasValue ? "select-all" : ""}
          `}
        >
          {hasValue ? value : "N/A"}
        </span>

        {copy && hasValue && <CopyButton value={value} />}
      </div>
    </div>
  );
};


// Reference Row
const ReferenceRow = ({ label, value }) => {
  const hasValue =
    value !== null &&
    value !== undefined &&
    value !== "" &&
    value !== "—";

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 py-3.5 first:pt-0 last:pb-0 border-b last:border-b-0 border-gray-100">
      <div className="sm:w-[190px] shrink-0">
        <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-[0.08em]">
          {label}
        </span>
      </div>

      {hasValue ? (
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="min-w-0 flex-1">
            <span className="block text-[12px] sm:text-[13px] font-semibold font-mono text-gray-800 truncate">
              {value}
            </span>
          </div>

          <CopyButton value={value} />
        </div>
      ) : (
        <span className="text-sm text-gray-400 italic">
          Not associated
        </span>
      )}
    </div>
  );
};


// Section Header
const SectionHeader = ({ icon: Icon, label }) => {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <Icon size={16} className="text-[#532C89]" />

      <h3 className="text-[13px] font-bold text-gray-700">
        {label}
      </h3>

      <div className="h-px flex-1 bg-gray-100" />
    </div>
  );
};

// Main Modal
const TransactionDetailsModal = ({ transaction, onClose }) => {
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

  if (!transaction) return null;

  const {
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    customerCity,
    paymentType,
    amount,
    paymentMethod,
    merchantTxnId,
    customerOrderId,
    transactionId,
    gameBookingId,
    foodOrderId,
    status,
    createdAt,
    updatedAt,
    user,
  } = transaction;


  // Customer
  const resolvedName =
    customerName ||
    (user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "") ||
    "Guest Customer";

  const initials = resolvedName.charAt(0).toUpperCase();

  const userImage = user?.image || null;

  const resolvedEmail = customerEmail || user?.email || null;


  // Address
  const addressParts = [customerAddress, customerCity].filter(Boolean);
  const fullAddress = addressParts.join(", ") || null;


  // Status
  const statusKey = (status || "").toUpperCase();

  const statusBadgeClass =
    STATUS_STYLES[statusKey] ||
    "bg-gray-50 text-gray-500 border-gray-200";

  // Dates
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

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
          bg-white
          w-full
          max-w-3xl
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
              Transaction Details
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
          "
        >
          {/* Customer Information */}
          <section className="mb-7">
            <SectionHeader
              icon={User}
              label="Customer Information"
            />

            <div
              className="
                flex flex-col sm:flex-row
                gap-4
                p-4
                rounded-xl
                bg-gray-50/70
                border border-gray-100
              "
            >
              {/* Avatar */}
              {userImage ? (
                <img
                  src={userImage}
                  alt={resolvedName}
                  className="
                    w-14 h-14
                    sm:w-16 sm:h-16
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
                    sm:w-16 sm:h-16
                    rounded-xl
                    bg-[#532C89]/10
                    border border-[#532C89]/10
                    flex items-center justify-center
                    text-[#532C89]
                    text-xl sm:text-2xl
                    font-bold
                    shrink-0
                  "
                >
                  {initials}
                </div>
              )}

              {/* Customer info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
                  <h4 className="text-base font-bold text-gray-900">
                    {resolvedName}
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Email"
                    value={resolvedEmail}
                    copy
                  />

                  <Field
                    label="Phone"
                    value={customerPhone}
                    copy
                  />
                </div>

                {fullAddress && (
                  <div className="mt-4 pt-3 border-t border-gray-200/70">
                    <Field
                      label="Address"
                      value={fullAddress}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Payment Details */}
          <section className="mb-7">
            <SectionHeader
              icon={CreditCard}
              label="Payment Details"
            />

            <div className="border border-gray-100 rounded-xl overflow-hidden">
              {/* Main payment information */}
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
                {/* Amount */}
                <div className="p-4">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">
                    Amount
                  </span>

                  <span className="text-lg font-bold text-gray-900">
                    ৳{amount ?? "0"}
                  </span>
                </div>

                {/* Payment Type */}
                <div className="p-4">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">
                    Payment Type
                  </span>

                  <span className="text-sm font-semibold text-gray-800">
                    {paymentType || "N/A"}
                  </span>
                </div>

                {/* Method */}
                <div className="p-4">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">
                    Payment Method
                  </span>

                  <span className="text-sm font-semibold text-gray-800">
                    {paymentMethod || "N/A"}
                  </span>
                </div>

                {/* Status */}
                <div className="p-4">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">
                    Status
                  </span>

                  <span
                    className={`
                      inline-flex
                      items-center
                      px-2.5
                      py-1
                      rounded-full
                      border
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      ${statusBadgeClass}
                    `}
                  >
                    {status || "N/A"}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-gray-100">
                <div className="p-4">
                  <Field
                    label="Created Date"
                    value={formatDate(createdAt)}
                  />
                </div>

                <div className="p-4 sm:border-l border-gray-100">
                  <Field
                    label="Last Updated"
                    value={formatDate(updatedAt)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Transaction References */}
          <section>
            <SectionHeader
              icon={Receipt}
              label="Transaction & Order References"
            />

            <div className="border border-gray-100 rounded-xl px-4 sm:px-5">
              <ReferenceRow
                label="Merchant Transaction ID"
                value={merchantTxnId}
              />

              <ReferenceRow
                label="Customer Order ID"
                value={customerOrderId}
              />

              <ReferenceRow
                label="Transaction ID"
                value={transactionId}
              />

              <ReferenceRow
                label="Game Booking ID"
                value={gameBookingId}
              />

              <ReferenceRow
                label="Food Order ID"
                value={foodOrderId}
              />
            </div>
          </section>
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

      {/* Modal Animation */}
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

export default TransactionDetailsModal;