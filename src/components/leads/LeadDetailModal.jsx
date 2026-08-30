import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import {
  X,
  User,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  CalendarDays,
  BadgeCheck,
} from "lucide-react";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";

  const d = new Date(dateStr);

  if (isNaN(d.getTime())) return dateStr;

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ─────────────────────────────────────────────────────────────
// Copyable Field
// ─────────────────────────────────────────────────────────────
const CopyField = ({ label, value, icon: Icon }) => {
  const [copied, setCopied] = useState(false);

  const canCopy = value && value !== "—";

  const handleCopy = async () => {
    if (!canCopy) return;

    try {
      await navigator.clipboard.writeText(String(value));

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5 transition-all hover:border-gray-200 hover:bg-gray-50">
      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
        <Icon size={14} className="text-gray-500" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-gray-400">
          {label}
        </p>

        <p className="truncate text-sm font-semibold text-gray-800">
          {value || "—"}
        </p>
      </div>

      {/* Copy */}
      {canCopy && (
        <button
          type="button"
          onClick={handleCopy}
          title={`Copy ${label}`}
          aria-label={`Copy ${label}`}
          className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-all duration-200 ${
            copied
              ? "border-green-200 bg-green-50 text-green-600"
              : "border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          {copied ? (
            <Check size={13} strokeWidth={2.5} />
          ) : (
            <Copy size={13} />
          )}
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────
const StatusBadge = ({ active }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        active
          ? "border-green-200 bg-green-50 text-green-600"
          : "border-red-200 bg-red-50 text-red-500"
      }`}
    >
      {active ? (
        <CheckCircle2 size={11} />
      ) : (
        <XCircle size={11} />
      )}

      {active ? "ACTIVE" : "INACTIVE"}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────
// Verification Badge
// ─────────────────────────────────────────────────────────────
const VerificationBadge = ({ verified }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        verified
          ? "border-blue-200 bg-blue-50 text-blue-600"
          : "border-gray-200 bg-gray-50 text-gray-400"
      }`}
    >
      <ShieldCheck size={11} />

      {verified ? "VERIFIED" : "UNVERIFIED"}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────
// User Details Modal
// ─────────────────────────────────────────────────────────────
const LeadDetailModal = ({ lead, onClose }) => {
  useEffect(() => {
    if (!lead) return;

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
  }, [lead, onClose]);

  if (!lead) return null;

  const fullName =
    [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unknown User";

  const initials =
    [lead.firstName?.[0], lead.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "U";

  const isActive =
    lead.status === "ACTIVE" || lead.status === "Active";

  const isVerified =
    lead.isverified ?? lead.isVerified ?? false;

  const role = lead.role || "USER";

  const metaItems = useMemo(
    () => [
      {
        label: "Role",
        value: role,
        icon: ShieldCheck,
      },
      {
        label: "Account Status",
        value: lead.status || "—",
        icon: BadgeCheck,
      },
      {
        label: "Joined",
        value: formatDate(lead.createdAt),
        icon: CalendarDays,
      },
      {
        label: "Last Updated",
        value: formatDate(lead.updatedAt),
        icon: CalendarDays,
      },
    ],
    [lead, role]
  );

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="flex w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{
          maxHeight: "calc(100vh - 24px)",
          animation: "modalIn 0.22s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header  */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold leading-none text-gray-900">
                User Details
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-all hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={17} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-4">

            {/* Identity Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#532C89] to-[#306BAC] p-4 shadow-sm">
              {/* Decorative circles */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/5" />
              <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/5" />

              <div className="relative flex items-center gap-3.5">
                {/* Avatar */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-white/25 bg-white/15 text-xl font-extrabold text-white shadow-inner">
                  {lead.image ? (
                    <img
                      src={lead.image}
                      alt={fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                {/* Identity */}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-bold leading-tight text-white">
                    {fullName}
                  </h3>

                  <p className="mt-1 truncate text-xs font-medium text-white/65">
                    {lead.email || "No email address"}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold ${
                        isActive
                          ? "bg-green-400/20 text-green-100"
                          : "bg-red-400/20 text-red-100"
                      }`}
                    >
                      {isActive ? (
                        <CheckCircle2 size={10} />
                      ) : (
                        <XCircle size={10} />
                      )}

                      {lead.status || "UNKNOWN"}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold text-white/80">
                      <ShieldCheck size={10} />
                      {isVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Overview */}
            <div>
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                  Account Overview
                </p>

                <StatusBadge active={isActive} />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                  <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm">
                    <ShieldCheck size={13} className="text-[#532C89]" />
                  </div>

                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Role
                  </p>

                  <p className="mt-0.5 text-sm font-bold uppercase text-gray-800">
                    {role}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                  <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm">
                    <BadgeCheck
                      size={13}
                      className={
                        isVerified
                          ? "text-blue-500"
                          : "text-gray-400"
                      }
                    />
                  </div>

                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Verification
                  </p>

                  <p
                    className={`mt-0.5 text-sm font-bold ${
                      isVerified
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {isVerified ? "Verified" : "Unverified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <div className="mb-2 px-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                  Contact Information
                </p>
              </div>

              <div className="space-y-2">
                <CopyField
                  icon={User}
                  label="Full Name"
                  value={fullName}
                />

                <CopyField
                  icon={Mail}
                  label="Email Address"
                  value={lead.email || "—"}
                />

                <CopyField
                  icon={Phone}
                  label="Phone Number"
                  value={lead.phone || "—"}
                />
              </div>
            </div>

            {/* Account Timeline */}
            <div>
              <div className="mb-2 px-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                  Account Timeline
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  {metaItems.map(
                    ({ label, value, icon: Icon }) => (
                      <div
                        key={label}
                        className="flex items-start gap-2.5"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white">
                          <Icon
                            size={12}
                            className="text-gray-500"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                            {label}
                          </p>

                          <p className="mt-0.5 truncate text-xs font-semibold text-gray-700">
                            {value}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end border-t border-gray-100 bg-gray-50/60 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-100 hover:text-gray-800"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
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

export default LeadDetailModal;