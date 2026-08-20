import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import {
  X, Utensils, Tag, Clock, Truck, FileText,
  CheckCircle2, XCircle, Image as ImageIcon, Pencil, Percent,
} from "lucide-react";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={13} className="text-gray-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-0.5 break-words">{value ?? "—"}</p>
    </div>
  </div>
);

const ViewFoodModal = ({ food, onClose, onEdit }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!food) return null;

  const images = Array.isArray(food.images) ? food.images : [];
  const isAvailable = !food.isDelete && food.status !== "UNAVAILABLE";
  const categoryName =
    typeof food.category === "object" ? food.category?.name : food.category;
  
  // Backend stores isDisCount (capital C) and disCountParcentage
  const discountVal = food.disCountParcentage ?? food.discountParcentage ?? food.discountPercentage ?? food.discountParcenTage ?? 0;
  const showDiscount = (food.isDisCount ?? food.isDiscount) && Number(discountVal) > 0;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col"
        style={{ maxHeight: "calc(100vh - 24px)", animation: "modalIn 0.2s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-none">Food Details</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* Hero: image gallery + name + status */}
          <div className="flex items-start gap-4">
            {/* Image gallery — show up to 2 */}
            <div className="flex gap-2 shrink-0">
              {images.length > 0 ? (
                images.slice(0, 2).map((src, i) => (
                  <img
                    key={i}
                    src={typeof src === "object" ? src?.url : src}
                    alt={`${food.name}-${i}`}
                    className="w-20 h-20 rounded-xl object-cover border border-gray-100"
                  />
                ))
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300">
                  <ImageIcon size={28} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 leading-tight truncate">{food.name}</h3>

              {/* Status + Category badges */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isAvailable ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                }`}>
                  {isAvailable ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                  {isAvailable ? "Available" : "Unavailable"}
                </span>
                {categoryName && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-600">
                    <Tag size={10} />
                    {categoryName}
                  </span>
                )}
              </div>

              {food.short_description && (
                <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-3">
                  {food.short_description}
                </p>
              )}
            </div>
          </div>

          {/* Pricing card */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 mb-1">Price</p>
              <p className="text-xl font-bold text-gray-900">৳{food.price ?? "—"}</p>
            </div>
            <div className="col-span-1 bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 mb-1">Delivery Fee</p>
              <p className="text-xl font-bold text-gray-900">৳{food.delivery_fee ?? food.deliveryFee ?? "—"}</p>
            </div>
            <div className="col-span-1 bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 mb-1">Delivery Time</p>
              <p className="text-xl font-bold text-gray-900">
                {food.delivery_time ?? food.deliveryTime ?? "—"}
                {(food.delivery_time || food.deliveryTime) && (
                  <span className="text-xs font-normal text-gray-400 ml-0.5">min</span>
                )}
              </p>
            </div>
          </div>

          {/* Discount Segment */}
          {showDiscount && (
            <div className="flex items-center gap-3 p-3 rounded-xl border bg-amber-50 border-amber-200">
              <Percent size={16} className="text-amber-500" />
              <div>
                <p className="text-xs font-semibold text-gray-700">Discount Active</p>
                <p className="text-sm font-bold text-amber-600">
                  {discountVal}% off
                </p>
              </div>
            </div>
          )}

          {/* Details list */}
          <div className="bg-gray-50/70 rounded-xl border border-gray-100 px-3 divide-y divide-gray-100">
            <InfoRow icon={CheckCircle2} label="Status" value={food.status ?? "AVAILABLE"} />
            <InfoRow icon={Tag} label="Category" value={categoryName} />
            <InfoRow icon={Clock} label="Delivery Time" value={food.delivery_time ? `${food.delivery_time} mins` : food.deliveryTime} />
            <InfoRow icon={Truck} label="Delivery Fee" value={food.delivery_fee != null ? `৳${food.delivery_fee}` : food.deliveryFee} />
          </div>

          {/* All images */}
          {images.length > 1 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">All Images</p>
              <div className="flex flex-wrap gap-2">
                {images.map((src, i) => (
                  <img
                    key={i}
                    src={typeof src === "object" ? src?.url : src}
                    alt={`img-${i}`}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Meta timestamps */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100 text-xs text-gray-400">
            <div>
              <p className="font-semibold text-gray-500">Created</p>
              <p>{food.createdAt ? new Date(food.createdAt).toLocaleDateString() : "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500">Updated</p>
              <p>{food.updatedAt ? new Date(food.updatedAt).toLocaleDateString() : "—"}</p>
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
            onClick={() => { onClose(); onEdit(food); }}
            className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <Pencil size={14} />
            Edit Food
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

export default ViewFoodModal;
