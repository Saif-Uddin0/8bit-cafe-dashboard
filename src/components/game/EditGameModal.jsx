import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { X, Upload, Clock, Gamepad2, ImageIcon } from "lucide-react";

const WEEKDAYS = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const defaultSchedule = { openTime: "09:00 AM", endTime: "05:00 PM" };

const EditGameModal = ({ game, onClose, onUpdate, categories = [] }) => {
  const modalRef = useRef(null);


  const [name, setName] = useState(game?.name ?? "");
  const [description, setDescription] = useState(game?.description ?? "");
  const [categoryId, setCategoryId] = useState(game?.categoryId ?? game?.category?.id ?? "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    Array.isArray(game?.images) && game.images.length > 0 ? game.images[0] : null
  );

  const [slot30, setSlot30] = useState(game?.price30Min != null);
  const [slot60, setSlot60] = useState(game?.price60Min != null);
  const [price30Min, setPrice30Min] = useState(game?.price30Min ?? "");
  const [price60Min, setPrice60Min] = useState(game?.price60Min ?? "");

  const [isDiscount, setIsDiscount] = useState(game?.isDiscount ?? false);
  const [discountPercent, setDiscountPercent] = useState(
    game?.disCountParcenTage ?? game?.discountParcenTage ?? ""
  );

  const handleDiscountPercentChange = (val) => {
    setDiscountPercent(val);
    const numericValue = parseFloat(val);
    if (!isNaN(numericValue) && numericValue > 0) {
      setIsDiscount(true);
    } else {
      setIsDiscount(false);
    }
  };

  const handleIsDiscountChange = (checked) => {
    setIsDiscount(checked);
    if (!checked) {
      setDiscountPercent("0");
    } else {
      const numericValue = parseFloat(discountPercent);
      if (isNaN(numericValue) || numericValue <= 0) {
        setDiscountPercent("");
      }
    }
  };

  // Status
  const [status, setStatus] = useState(
    game?.status === "AVAILABLE" || game?.status === "Available" ? "AVAILABLE" : "UNAVAILABLE"
  );

  // Build enabledDays & schedules from existing game.schedules
  const [enabledDays, setEnabledDays] = useState(() => {
    const map = {};
    WEEKDAYS.forEach((d) => { map[d] = false; });
    (game?.schedules ?? []).forEach((s) => { if (WEEKDAYS.includes(s.day)) map[s.day] = true; });
    return map;
  });

  const [schedules, setSchedules] = useState(() => {
    const map = {};
    WEEKDAYS.forEach((d) => { map[d] = { ...defaultSchedule }; });
    (game?.schedules ?? []).forEach((s) => {
      if (WEEKDAYS.includes(s.day)) map[s.day] = { openTime: s.openTime, endTime: s.endTime };
    });
    return map;
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Close on Escape, lock body scroll
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const toggleDay = (day) => {
    setEnabledDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const updateSchedule = (day, field, value) => {
    setSchedules((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const validate = () => {
    const errs = {};
    if (!name.trim())         errs.name        = "Game name is required";
    if (!categoryId)          errs.categoryId  = "Category is required";
    if (!description.trim())  errs.description = "Description is required";
    if (!slot30 && !slot60)   errs.slots       = "Select at least one time slot";
    if (slot30 && !price30Min) errs.price30Min = "Price for 30 min is required";
    if (slot60 && !price60Min) errs.price60Min = "Price for 60 min is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const schedulesArray = WEEKDAYS.filter((day) => enabledDays[day]).map((day) => ({
      day,
      openTime: schedules[day].openTime,
      endTime: schedules[day].endTime,
    }));

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("categoryId", categoryId);
    if (imageFile) formData.append("images", imageFile);
    const numericDiscount = parseFloat(discountPercent);
    const hasDiscount = isDiscount && !isNaN(numericDiscount) && numericDiscount > 0;
    formData.append("isDiscount", hasDiscount ? "true" : "false");
    formData.append("disCountParcenTage", hasDiscount ? String(numericDiscount) : "0");
    formData.append("discountParcenTage", hasDiscount ? String(numericDiscount) : "0");
    if (slot30 && price30Min) formData.append("price30Min", price30Min);
    if (slot60 && price60Min) formData.append("price60Min", price60Min);
    formData.append("schedules", JSON.stringify(schedulesArray));
    formData.append("status", status);

    setSubmitting(true);
    try {
      await onUpdate(game.id, formData);
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: "calc(100vh - 24px)", animation: "modalIn 0.2s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Fixed Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#532C89]/10 flex items-center justify-center">
              <Gamepad2 size={16} className="text-[#532C89]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-none">Edit Game</h2>
              <p className="text-xs text-gray-400 mt-0.5">Update game details below</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <form onSubmit={handleSubmit} id="edit-game-form" className="space-y-4">

            {/* Row 1: Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Game Name
                </label>
                <input
                  type="text"
                  placeholder="Enter game name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#532C89]/30 focus:border-[#532C89] focus:bg-white text-gray-800 transition-all placeholder:text-gray-400 ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">⚠ {errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#532C89]/30 focus:border-[#532C89] focus:bg-white text-gray-800 appearance-none cursor-pointer transition-all ${errors.categoryId ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-xs text-red-500 mt-1">⚠ {errors.categoryId}</p>}
              </div>
            </div>

            {/* Row 2: Image Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Game Image <span className="text-gray-400 normal-case font-normal">(leave blank to keep current)</span>
              </label>
              <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-all group ${errors.image ? "border-red-400 bg-red-50/30" : "border-gray-200 hover:border-[#532C89]/40"}`}>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 group-hover:bg-[#532C89]/10 flex items-center justify-center text-gray-300 group-hover:text-[#532C89]/50 transition-all shrink-0">
                    <ImageIcon size={22} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-600 flex items-center gap-1.5 truncate">
                    <Upload size={13} />
                    {imageFile ? imageFile.name : imagePreview ? "Click to replace image" : "Click to upload image"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP supported</p>
                </div>
              </label>
            </div>

            {/* Row 3: Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Description
              </label>
              <textarea
                placeholder="Enter game description"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#532C89]/30 focus:border-[#532C89] focus:bg-white text-gray-800 resize-none transition-all placeholder:text-gray-400 ${errors.description ? "border-red-400 bg-red-50" : "border-gray-200"}`}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">⚠ {errors.description}</p>}
            </div>

            {/* Row 4: Time Slots & Pricing */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Time Slots & Pricing
              </label>
              {errors.slots && <p className="text-xs text-red-500 mb-2">⚠ {errors.slots}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 30 min */}
                <div className={`border rounded-xl p-3 transition-all ${slot30 ? "border-[#532C89] bg-[#532C89]/5" : "border-gray-200 bg-gray-50/50"}`}>
                  <label className="flex items-center gap-2 cursor-pointer mb-2.5">
                    <input type="checkbox" checked={slot30} onChange={(e) => setSlot30(e.target.checked)} className="w-4 h-4 rounded accent-[#532C89] cursor-pointer" />
                    <span className="text-sm font-semibold text-gray-700">30 min slot</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Price (৳)"
                    disabled={!slot30}
                    value={price30Min}
                    onChange={(e) => setPrice30Min(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#532C89] text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all ${errors.price30Min ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"}`}
                  />
                  {errors.price30Min && <p className="text-xs text-red-500 mt-1">⚠ {errors.price30Min}</p>}
                </div>

                {/* 60 min */}
                <div className={`border rounded-xl p-3 transition-all ${slot60 ? "border-[#532C89] bg-[#532C89]/5" : "border-gray-200 bg-gray-50/50"}`}>
                  <label className="flex items-center gap-2 cursor-pointer mb-2.5">
                    <input type="checkbox" checked={slot60} onChange={(e) => setSlot60(e.target.checked)} className="w-4 h-4 rounded accent-[#532C89] cursor-pointer" />
                    <span className="text-sm font-semibold text-gray-700">60 min slot</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Price (৳)"
                    disabled={!slot60}
                    value={price60Min}
                    onChange={(e) => setPrice60Min(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#532C89] text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all ${errors.price60Min ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"}`}
                  />
                  {errors.price60Min && <p className="text-xs text-red-500 mt-1">⚠ {errors.price60Min}</p>}
                </div>
              </div>
            </div>

            {/* Row 5: Discount */}
            <div className={`flex items-center gap-3 p-3 border rounded-xl transition-all ${isDiscount ? "border-[#532C89]/40 bg-[#532C89]/5" : "border-gray-200 bg-gray-50/50"}`}>
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isDiscount}
                  onChange={(e) => handleIsDiscountChange(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#532C89] cursor-pointer"
                />
                <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Apply Discount</span>
              </label>
              <input
                type="number"
                placeholder="Discount % (e.g. 15)"
                disabled={!isDiscount}
                value={discountPercent}
                onChange={(e) => handleDiscountPercentChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#532C89] text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white transition-all"
              />
            </div>

            {/* Row 5b: Status toggle */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Availability Status
              </label>
              <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setStatus("AVAILABLE")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    status === "AVAILABLE"
                      ? "bg-green-500 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${status === "AVAILABLE" ? "bg-white" : "bg-gray-400"}`} />
                  Available
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("UNAVAILABLE")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    status === "UNAVAILABLE"
                      ? "bg-red-500 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${status === "UNAVAILABLE" ? "bg-white" : "bg-gray-400"}`} />
                  Unavailable
                </button>
              </div>
            </div>

            {/* Row 6: Operating Hours */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5 pt-1 border-t border-gray-100">
                <Clock size={14} className="text-[#532C89]" />
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">Operating Hours</span>
                <span className="text-xs text-gray-400 ml-0.5">(toggle days on/off)</span>
              </div>
              <div className="space-y-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className={`flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-xl border transition-all ${enabledDays[day] ? "border-[#532C89]/25 bg-[#532C89]/5" : "border-gray-100 bg-gray-50/60 opacity-60"}`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer shrink-0 sm:w-28">
                      <input
                        type="checkbox"
                        checked={!!enabledDays[day]}
                        onChange={() => toggleDay(day)}
                        className="w-3.5 h-3.5 rounded accent-[#532C89] cursor-pointer"
                      />
                      <span className={`text-xs font-semibold capitalize ${enabledDays[day] ? "text-[#532C89]" : "text-gray-400"}`}>
                        {day.charAt(0) + day.slice(1).toLowerCase()}
                      </span>
                    </label>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        placeholder="Open"
                        disabled={!enabledDays[day]}
                        value={schedules[day].openTime}
                        onChange={(e) => updateSchedule(day, "openTime", e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#532C89] text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      />
                      <span className="text-xs text-gray-400 shrink-0">to</span>
                      <input
                        type="text"
                        placeholder="Close"
                        disabled={!enabledDays[day]}
                        value={schedules[day].endTime}
                        onChange={(e) => updateSchedule(day, "endTime", e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#532C89] text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        {/* ── Fixed Footer ── */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-game-form"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#532C89] hover:bg-[#6C04D7] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Gamepad2 size={14} />
                Save Changes
              </>
            )}
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

export default EditGameModal;
