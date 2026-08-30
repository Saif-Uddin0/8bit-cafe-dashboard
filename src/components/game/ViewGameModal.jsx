import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import {
  X,
  Gamepad2,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  Percent,
  CalendarDays,
  Pencil,
  CalendarClock,
} from "lucide-react";
import ImageCarousel from "../global/ImageCarousel";

// Constants

const WEEKDAY_ORDER = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];


// Time helpers

const normalizeTime = (timeStr) => {
  if (!timeStr) return "";

  // ISO / Date-time string
  if (timeStr.includes("T")) {
    try {
      const timePart = timeStr.split("T")[1];

      if (timePart) {
        const parts = timePart.split(":");

        let hours = parseInt(parts[0], 10);
        const minutes = parts[1] || "00";

        if (Number.isNaN(hours)) return timeStr.trim();

        const ampm = hours >= 12 ? "PM" : "AM";

        hours = hours % 12;
        if (hours === 0) hours = 12;

        return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
      }
    } catch {
      return timeStr.trim();
    }
  }

  const cleaned = String(timeStr).replace(/\s+/g, "").toUpperCase();

  const match =
    cleaned.match(/^(\d{1,2}):?(\d{2})(AM|PM)?$/) ||
    cleaned.match(/^(\d{1,2})(AM|PM)$/);

  if (!match) return String(timeStr).trim();

  const hours = match[1];
  const minutes = match[2] || "00";
  const ampm = match[3] || "";

  if (ampm) {
    return `${hours}:${minutes} ${ampm}`;
  }

  return `${hours}:${minutes}`;
};

// Schedule grouping

const groupSchedules = (schedules) => {
  if (!Array.isArray(schedules) || schedules.length === 0) {
    return [];
  }

  const groups = [];
  let currentGroup = null;

  schedules.forEach((schedule) => {
    const timeKey = `${normalizeTime(schedule.openTime)} - ${normalizeTime(
      schedule.endTime
    )}`;

    if (!currentGroup) {
      currentGroup = {
        days: [schedule.day],
        timeKey,
        openTime: schedule.openTime,
        endTime: schedule.endTime,
      };
      return;
    }

    if (currentGroup.timeKey === timeKey) {
      currentGroup.days.push(schedule.day);
    } else {
      groups.push(currentGroup);

      currentGroup = {
        days: [schedule.day],
        timeKey,
        openTime: schedule.openTime,
        endTime: schedule.endTime,
      };
    }
  });

  if (currentGroup) {
    groups.push(currentGroup);
  }

  return groups.map((group) => {
    const days = group.days;

    const isEveryDay = days.length === 7;

    const isWeekdays =
      days.length === 5 &&
      ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].every((day) =>
        days.includes(day)
      );

    const isWeekends =
      days.length === 2 &&
      days.includes("SATURDAY") &&
      days.includes("SUNDAY");

    let dayStr = "";

    const formatDay = (day) => {
      if (!day) return "";
      return day.charAt(0) + day.slice(1, 3).toLowerCase();
    };

    if (isEveryDay) {
      dayStr = "Every Day";
    } else if (isWeekdays) {
      dayStr = "Weekdays";
    } else if (isWeekends) {
      dayStr = "Weekends";
    } else {
      const indices = days.map((day) => WEEKDAY_ORDER.indexOf(day));

      const isConsecutive = indices.every(
        (value, index) =>
          index === 0 || value === indices[index - 1] + 1
      );

      if (isConsecutive && days.length > 2) {
        dayStr = `${formatDay(days[0])} - ${formatDay(
          days[days.length - 1]
        )}`;
      } else {
        dayStr = days.map(formatDay).join(", ");
      }
    }

    return {
      dayStr,
      openTime: group.openTime,
      endTime: group.endTime,
    };
  });
};

// Small reusable components

const SectionTitle = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 mb-2.5">
    <div className="w-7 h-7 rounded-lg bg-[#532C89]/10 flex items-center justify-center shrink-0">
      <Icon size={14} className="text-[#532C89]" />
    </div>

    <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
      {children}
    </h4>
  </div>
);

const StatCard = ({ label, value, suffix }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
      {label}
    </p>

    <div className="flex items-baseline gap-1 mt-1">
      <p className="text-lg font-extrabold text-gray-900">{value}</p>

      {suffix && (
        <span className="text-[10px] font-medium text-gray-400">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const MetaItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
      {label}
    </p>

    <p className="text-xs font-semibold text-gray-600">
      {value || "—"}
    </p>
  </div>
);

// Main Modal

const ViewGameModal = ({ game, onClose, onEdit }) => {
  // Body scroll lock + Escape
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

  if (!game) return null;

  // Game data

  const isAvailable =
    game.status === "AVAILABLE" ||
    game.status === "Available";

  const categoryName =
    typeof game.category === "object"
      ? game.category?.name
      : game.category;

  const discountValue =
    game.disCountParcenTage ??
    game.discountParcenTage ??
    game.disCountParcentage ??
    game.discountPercentage ??
    0;

  const hasDiscount =
    Boolean(game.isDiscount ?? game.isDisCount) &&
    Number(discountValue) > 0;

  const images = Array.isArray(game.images) ? game.images : [];

  const sortedSchedules = [...(game.schedules ?? [])].sort(
    (a, b) =>
      WEEKDAY_ORDER.indexOf(a.day) -
      WEEKDAY_ORDER.indexOf(b.day)
  );

  const groupedSchedules = groupSchedules(sortedSchedules);

  // Render

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          maxHeight: "calc(100vh - 24px)",
          animation: "modalIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                Game Details
              </h2>
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

        {/*  Scrollable Body */}

        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
          {/*  Hero */}

          <section>
            <div className="flex items-start gap-4">
              {/*  Image */}
              <div className="w-24 h-24 sm:w-28 sm:h-24 rounded-xl overflow-hidden border border-gray-100 bg-gray-100 shrink-0 shadow-sm">
                <ImageCarousel
                  images={images}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-lg font-extrabold text-gray-900 leading-tight break-words">
                      {game.name || "Unnamed Game"}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {/* Availability */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isAvailable
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-red-50 text-red-600 border-red-100"
                        }`}
                      >
                        {isAvailable ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <XCircle size={11} />
                        )}

                        {isAvailable ? "Available" : "Unavailable"}
                      </span>

                      {/* Category */}
                      {categoryName && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-[#532C89] border border-purple-100">
                          <Tag size={10} />
                          {categoryName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {game.description && (
                  <p className="text-xs text-gray-500 mt-2.5 leading-relaxed line-clamp-3">
                    {game.description}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/*  Pricing */}

          <section>
            <SectionTitle icon={Gamepad2}>
              Pricing
            </SectionTitle>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="30 Minutes"
                value={
                  game.price30Min != null
                    ? `৳${game.price30Min}`
                    : "N/A"
                }
              />

              <StatCard
                label="60 Minutes"
                value={
                  game.price60Min != null
                    ? `৳${game.price60Min}`
                    : "N/A"
                }
              />
            </div>
          </section>

          {/*  Discount */}

          <section>
            <div
              className={`rounded-xl border p-3.5 flex items-center justify-between gap-3 ${
                hasDiscount
                  ? "bg-amber-50 border-amber-200"
                  : "bg-gray-50/70 border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    hasDiscount
                      ? "bg-amber-100"
                      : "bg-gray-100"
                  }`}
                >
                  <Percent
                    size={15}
                    className={
                      hasDiscount
                        ? "text-amber-600"
                        : "text-gray-400"
                    }
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800">
                    {hasDiscount
                      ? "Discount Active"
                      : "No Discount"}
                  </p>

                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {hasDiscount
                      ? "A promotional discount is currently applied."
                      : "This game currently has no active discount."}
                  </p>
                </div>
              </div>

              {hasDiscount && (
                <span className="text-sm font-extrabold text-amber-600 shrink-0">
                  {discountValue}% OFF
                </span>
              )}
            </div>
          </section>

          {/*  Operating Hours */}

          {groupedSchedules.length > 0 && (
            <section>
              <SectionTitle icon={Clock}>
                Operating Hours
              </SectionTitle>

              <div className="space-y-2">
                {groupedSchedules.map((group, index) => (
                  <div
                    key={`${group.dayStr}-${index}`}
                    className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-[#532C89]/5 hover:border-[#532C89]/10 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#532C89]/10 flex items-center justify-center shrink-0">
                        <CalendarDays
                          size={13}
                          className="text-[#532C89]"
                        />
                      </div>

                      <span className="text-xs font-bold text-gray-800 truncate">
                        {group.dayStr}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Clock
                        size={11}
                        className="text-gray-400"
                      />

                      <span className="text-xs font-bold text-[#532C89]">
                        {normalizeTime(group.openTime)}
                        {" – "}
                        {normalizeTime(group.endTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/*  Availability summary */}

          <section>
            <SectionTitle icon={CalendarClock}>
              Game Summary
            </SectionTitle>

            <div className="rounded-xl border border-gray-100 bg-gray-50/70 divide-y divide-gray-100 px-3">
              <div className="grid grid-cols-2 gap-4 py-3">
                <MetaItem
                  label="Status"
                  value={game.status || "—"}
                />

                <MetaItem
                  label="Category"
                  value={categoryName}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 py-3">
                <MetaItem
                  label="30 Min Price"
                  value={
                    game.price30Min != null
                      ? `৳${game.price30Min}`
                      : "—"
                  }
                />

                <MetaItem
                  label="60 Min Price"
                  value={
                    game.price60Min != null
                      ? `৳${game.price60Min}`
                      : "—"
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4 py-3">
                <MetaItem
                  label="Discount"
                  value={
                    hasDiscount
                      ? `${discountValue}%`
                      : "None"
                  }
                />

                <MetaItem
                  label="Schedules"
                  value={
                    sortedSchedules.length > 0
                      ? `${sortedSchedules.length} schedule${
                          sortedSchedules.length > 1 ? "s" : ""
                        }`
                      : "No schedule"
                  }
                />
              </div>
            </div>
          </section>

          {/*  Metadata */}

          <div className="grid grid-cols-2 gap-4 pt-1 border-t border-gray-100">
            <MetaItem
              label="Created"
              value={
                game.createdAt
                  ? new Date(game.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )
                  : "—"
              }
            />

            <MetaItem
              label="Last Updated"
              value={
                game.updatedAt
                  ? new Date(game.updatedAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )
                  : "—"
              }
            />
          </div>
        </div>

        {/* Footer */}

        <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 bg-white hover:bg-gray-100 hover:border-gray-300 rounded-xl text-xs font-bold text-gray-600 transition-all cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onEdit(game);
            }}
            className="px-5 py-2.5 bg-[#000000] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <Pencil size={13} />
            Edit Game
          </button>
        </div>
      </div>

      {/* Animation */}

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

export default ViewGameModal;