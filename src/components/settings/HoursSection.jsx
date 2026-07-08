import React, { useState } from "react";
import { Pencil, Check, X, Clock } from "lucide-react";

// ── Shared primitives (local to this file) ─────────────────────────────────────

const Card = ({ children }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    {children}
  </div>
);

const EditHeader = ({ icon: Icon, title, isEditing, onEdit, onSave, onCancel }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={16} className="text-gray-500" />}
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
    </div>
    <div className="flex items-center gap-2">
      {isEditing ? (
        <>
          <button onClick={onSave} title="Save"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#532C89] text-white hover:bg-[#6C04D7] transition-colors">
            <Check size={15} />
          </button>
          <button onClick={onCancel} title="Cancel"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <X size={15} />
          </button>
        </>
      ) : (
        <button onClick={onEdit} title="Edit"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <Pencil size={15} />
        </button>
      )}
    </div>
  </div>
);

// ── Hours Table ─────────────────────────────────────────────────────────────────
const TimeInput = ({ value, readOnly, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    readOnly={readOnly}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-3 py-2 rounded-lg text-sm text-gray-700 border transition-colors
      ${readOnly
        ? "bg-gray-50 border-gray-200 outline-none cursor-default"
        : "bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#532C89]/30 focus:border-[#532C89]"
      }`}
  />
);

const HoursBlock = ({ label, days, isEditing, times, onChange }) => (
  <div>
    {label && (
      <p className="text-base font-bold text-gray-900 mb-4">{label}</p>
    )}
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px]">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left w-1/3">
              Day
            </th>
            <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left pr-3">
              Open
            </th>
            <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left">
              Close
            </th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day} className="border-b border-gray-100 last:border-0">
              <td className="py-3 pr-4 text-sm text-gray-700">{day}</td>
              <td className="py-3 pr-3">
                <TimeInput
                  value={times[day]?.open ?? ""}
                  readOnly={!isEditing}
                  onChange={(e) => onChange(day, "open", e.target.value)}
                  placeholder="09:00 AM"
                />
              </td>
              <td className="py-3">
                <TimeInput
                  value={times[day]?.close ?? ""}
                  readOnly={!isEditing}
                  onChange={(e) => onChange(day, "close", e.target.value)}
                  placeholder="10:00 PM"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ── Default data ────────────────────────────────────────────────────────────────
const WEEK_DAYS    = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const WEEKEND_DAYS = ["Friday", "Saturday"];

const buildDefaults = (days) =>
  days.reduce((acc, d) => { acc[d] = { open: "12:12 PM", close: "10:00 PM" }; return acc; }, {});

// ── Main component ──────────────────────────────────────────────────────────────
/**
 * HoursSection — single card that contains both Weekday and Weekend hours tables.
 * Each sub-table has its own independent edit/save/cancel state.
 */
const HoursSection = ({ onSave }) => {
  // ── Weekday state
  const [weekSaved,     setWeekSaved]     = useState(buildDefaults(WEEK_DAYS));
  const [weekDraft,     setWeekDraft]     = useState(buildDefaults(WEEK_DAYS));
  const [weekEditing,   setWeekEditing]   = useState(false);

  const weekEdit   = () => { setWeekDraft({ ...weekSaved }); setWeekEditing(true); };
  const weekSave   = () => { setWeekSaved({ ...weekDraft }); setWeekEditing(false); onSave?.("week", weekDraft); };
  const weekCancel = () => { setWeekDraft({ ...weekSaved }); setWeekEditing(false); };
  const weekChange = (day, field, val) =>
    setWeekDraft((p) => ({ ...p, [day]: { ...p[day], [field]: val } }));

  // ── Weekend state
  const [wkndSaved,     setWkndSaved]     = useState(buildDefaults(WEEKEND_DAYS));
  const [wkndDraft,     setWkndDraft]     = useState(buildDefaults(WEEKEND_DAYS));
  const [wkndEditing,   setWkndEditing]   = useState(false);

  const wkndEdit   = () => { setWkndDraft({ ...wkndSaved }); setWkndEditing(true); };
  const wkndSave   = () => { setWkndSaved({ ...wkndDraft }); setWkndEditing(false); onSave?.("weekend", wkndDraft); };
  const wkndCancel = () => { setWkndDraft({ ...wkndSaved }); setWkndEditing(false); };
  const wkndChange = (day, field, val) =>
    setWkndDraft((p) => ({ ...p, [day]: { ...p[day], [field]: val } }));

  return (
    <Card>
      {/* ── Weekday Hours ── */}
      <EditHeader
        icon={Clock}
        title="Hours"
        isEditing={weekEditing}
        onEdit={weekEdit}
        onSave={weekSave}
        onCancel={weekCancel}
      />
      <HoursBlock
        days={WEEK_DAYS}
        isEditing={weekEditing}
        times={weekEditing ? weekDraft : weekSaved}
        onChange={weekChange}
      />

      {/* ── Weekend Hours ── */}
      <div className="mt-8">
        <EditHeader
          title="Weekend"
          isEditing={wkndEditing}
          onEdit={wkndEdit}
          onSave={wkndSave}
          onCancel={wkndCancel}
        />
        <HoursBlock
          days={WEEKEND_DAYS}
          isEditing={wkndEditing}
          times={wkndEditing ? wkndDraft : wkndSaved}
          onChange={wkndChange}
        />
      </div>
    </Card>
  );
};

export default HoursSection;
