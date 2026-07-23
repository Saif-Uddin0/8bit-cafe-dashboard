import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import {
  X, Gamepad2, Clock, Tag, Image as ImageIcon,
  CheckCircle2, XCircle, Percent, CalendarDays,
} from "lucide-react";

const WEEKDAY_ORDER = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

const ViewGameModal = ({ game, onClose, onEdit }) => {
  // Lock body scroll & close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!game) return null;

  const image = Array.isArray(game.images) && game.images.length > 0 ? game.images[0] : null;
  const isAvailable = game.status === "AVAILABLE" || game.status === "Available";

  // Sort schedules in weekday order
  const sortedSchedules = [...(game.schedules ?? [])].sort(
    (a, b) => WEEKDAY_ORDER.indexOf(a.day) - WEEKDAY_ORDER.indexOf(b.day)
  );

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
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#532C89]/10 flex items-center justify-center">
              <Gamepad2 size={16} className="text-[#532C89]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-none">Game Details</h2>
              <p className="text-xs text-gray-400 mt-0.5">Read-only view</p>
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
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* Hero: image + name + status */}
          <div className="flex items-start gap-4">
            {image ? (
              <img
                src={image}
                alt={game.name}
                className="w-20 h-20 rounded-xl object-cover border border-gray-100 shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 shrink-0">
                <ImageIcon size={28} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 leading-tight truncate">{game.name}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isAvailable ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                }`}>
                  {isAvailable ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                  {isAvailable ? "Available" : "Unavailable"}
                </span>
                {game.category?.name && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-600">
                    <Tag size={10} />
                    {game.category.name}
                  </span>
                )}
              </div>
              {game.description && (
                <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-3">{game.description}</p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pricing</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">30 Min</p>
                <p className="text-lg font-bold text-gray-900">
                  {game.price30Min != null ? `৳${game.price30Min}` : <span className="text-gray-300 text-sm">N/A</span>}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">60 Min</p>
                <p className="text-lg font-bold text-gray-900">
                  {game.price60Min != null ? `৳${game.price60Min}` : <span className="text-gray-300 text-sm">N/A</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Discount */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${
            game.isDiscount ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-100"
          }`}>
            <Percent size={16} className={game.isDiscount ? "text-amber-500" : "text-gray-300"} />
            <div>
              <p className="text-xs font-semibold text-gray-700">
                {game.isDiscount ? "Discount Active" : "No Discount"}
              </p>
              {game.isDiscount && game.disCountParcenTage && (
                <p className="text-sm font-bold text-amber-600">{game.disCountParcenTage}% off</p>
              )}
            </div>
          </div>

          {/* Operating Hours */}
          {sortedSchedules.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Clock size={14} className="text-[#532C89]" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Operating Hours</p>
              </div>
              <div className="space-y-1.5">
                {sortedSchedules.map((s) => (
                  <div key={s.id ?? s.day} className="flex items-center gap-3 px-3 py-2 bg-[#532C89]/5 border border-[#532C89]/15 rounded-xl">
                    <CalendarDays size={13} className="text-[#532C89] shrink-0" />
                    <span className="text-xs font-semibold text-[#532C89] w-24 shrink-0 capitalize">
                      {s.day.charAt(0) + s.day.slice(1).toLowerCase()}
                    </span>
                    <span className="text-xs text-gray-600 font-medium">
                      {s.openTime} → {s.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100 text-xs text-gray-400">
            <div>
              <p className="font-semibold text-gray-500">Created</p>
              <p>{game.createdAt ? new Date(game.createdAt).toLocaleDateString() : "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500">Updated</p>
              <p>{game.updatedAt ? new Date(game.updatedAt).toLocaleDateString() : "—"}</p>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => { onClose(); onEdit(game); }}
            className="px-6 py-2.5 bg-[#532C89] hover:bg-[#6C04D7] text-white rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <Gamepad2 size={14} />
            Edit Game
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

export default ViewGameModal;
