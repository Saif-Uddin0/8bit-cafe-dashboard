import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { X, Upload, Clock, Gamepad2, ImageIcon } from "lucide-react";

const WEEKDAYS = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const defaultSchedule = { openTime: "09:00 AM", endTime: "05:00 PM" };

const normalizeTime = (timeStr) => {
  if (!timeStr) return "";
  if (timeStr.includes("T")) {
    try {
      const timePart = timeStr.split("T")[1];
      if (timePart) {
        const parts = timePart.split(":");
        let hours = parseInt(parts[0], 10);
        const minutes = parts[1] || "00";
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        if (hours === 0) hours = 12;
        return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
      }
    } catch (e) {
      console.error(e);
    }
  }
  const cleaned = timeStr.replace(/\s+/g, "").toUpperCase();
  const match = cleaned.match(/^(\d{1,2}):?(\d{2})(AM|PM)?$/) || cleaned.match(/^(\d{1,2})(AM|PM)$/);
  if (!match) return timeStr.trim();
  
  const hours = match[1];
  const minutes = match[2] || "00";
  const ampm = match[3] || "";
  
  if (ampm) {
    return `${hours}:${minutes} ${ampm}`;
  }
  return `${hours}:${minutes}`;
};

const to24Hour = (time12h) => {
  if (!time12h) return "09:00";
  const cleaned = time12h.replace(/\s+/g, "").toUpperCase();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})(AM|PM)?$/);
  if (!match) return "09:00";
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3];
  
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const to12Hour = (time24h) => {
  if (!time24h) return "09:00 AM";
  const parts = time24h.split(":");
  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${ampm}`;
};

const formatTimeToISO = (timeStr) => {
  if (!timeStr) return "1970-01-01T00:00:00.000Z";
  if (timeStr.includes("T")) return timeStr;
  const time24 = to24Hour(timeStr);
  return `1970-01-01T${time24}:00.000Z`;
};

const TimePicker = ({ label, value, onChange, disabled }) => {
  const parsed = (() => {
    if (!value) return { hour: "09", minute: "00", ampm: "AM" };
    const cleaned = value.replace(/\s+/g, "").toUpperCase();
    const match = cleaned.match(/^(\d{1,2}):?(\d{2})(AM|PM)?$/) || cleaned.match(/^(\d{1,2})(AM|PM)$/);
    if (!match) return { hour: "09", minute: "00", ampm: "AM" };
    
    let hr = match[1].padStart(2, "0");
    let min = match[2] || "00";
    let ap = match[3] || "AM";
    return { hour: hr, minute: min, ampm: ap };
  })();

  const updateField = (field, newVal) => {
    const next = { ...parsed, [field]: newVal };
    onChange(`${next.hour}:${next.minute} ${next.ampm}`);
  };

  const hoursList = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutesList = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

  return (
    <div className={`flex flex-col flex-1 ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      {label && <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</label>}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#532C89]/20 focus-within:border-[#532C89]">
        <div className="flex items-center gap-1">
          <select
            value={parsed.hour}
            disabled={disabled}
            onChange={(e) => updateField("hour", e.target.value)}
            className="bg-transparent border-0 text-sm font-semibold text-gray-700 p-1 focus:ring-0 focus:outline-none cursor-pointer outline-none select-none appearance-none text-center"
            style={{ width: "32px" }}
          >
            {hoursList.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          
          <span className="text-xs text-gray-400 font-bold select-none">:</span>
          
          <select
            value={parsed.minute}
            disabled={disabled}
            onChange={(e) => updateField("minute", e.target.value)}
            className="bg-transparent border-0 text-sm font-semibold text-gray-700 p-1 focus:ring-0 focus:outline-none cursor-pointer outline-none select-none appearance-none text-center"
            style={{ width: "32px" }}
          >
            {minutesList.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-0.5 shrink-0 border border-gray-200/50">
          <button
            type="button"
            disabled={disabled}
            onClick={() => updateField("ampm", "AM")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
              parsed.ampm === "AM"
                ? "bg-white text-[#532C89] shadow-sm"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            AM
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => updateField("ampm", "PM")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
              parsed.ampm === "PM"
                ? "bg-white text-[#532C89] shadow-sm"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
};

const EditGameModal = ({ game, onClose, onUpdate, categories = [] }) => {
  const modalRef = useRef(null);


  const [name, setName] = useState(game?.name ?? "");
  const [description, setDescription] = useState(game?.description ?? "");
  const [categoryId, setCategoryId] = useState(game?.categoryId ?? game?.category?.id ?? "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    Array.isArray(game?.images) && game.images.length > 0
      ? (typeof game.images[0] === "object" ? game.images[0]?.url : game.images[0])
      : null
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
      if (WEEKDAYS.includes(s.day)) {
        map[s.day] = {
          openTime: normalizeTime(s.openTime),
          endTime: normalizeTime(s.endTime)
        };
      }
    });
    return map;
  });

  // Modern UX schedule mode: "SAME" (one schedule for all active days) or "CUSTOM"
  const [scheduleMode, setScheduleMode] = useState(() => {
    const activeDays = (game?.schedules ?? []).filter((s) => WEEKDAYS.includes(s.day));
    if (activeDays.length <= 1) return "SAME";
    const firstActive = activeDays[0];
    const isSame = activeDays.every(
      (s) => s.openTime === firstActive.openTime && s.endTime === firstActive.endTime
    );
    return isSame ? "SAME" : "CUSTOM";
  });

  const [commonOpenTime, setCommonOpenTime] = useState(() => {
    const activeDays = (game?.schedules ?? []).filter((s) => WEEKDAYS.includes(s.day));
    return activeDays.length > 0 ? normalizeTime(activeDays[0].openTime) : "09:00 AM";
  });

  const [commonEndTime, setCommonEndTime] = useState(() => {
    const activeDays = (game?.schedules ?? []).filter((s) => WEEKDAYS.includes(s.day));
    return activeDays.length > 0 ? normalizeTime(activeDays[0].endTime) : "05:00 PM";
  });

  const updateCommonSchedule = (field, value) => {
    if (field === "openTime") {
      setCommonOpenTime(value);
    } else if (field === "endTime") {
      setCommonEndTime(value);
    }
    setSchedules((prev) => {
      const next = { ...prev };
      WEEKDAYS.forEach((day) => {
        next[day] = { ...next[day], [field]: value };
      });
      return next;
    });
  };


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
      openTime: formatTimeToISO(schedules[day].openTime),
      endTime: formatTimeToISO(schedules[day].endTime),
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
              <div className="flex items-center justify-between gap-1.5 mb-3 pt-1 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#532C89]" />
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">Operating Hours</span>
                </div>
                
                {/* Segmented Control */}
                <div className="flex p-0.5 bg-gray-100 rounded-lg shrink-0 border border-gray-200/50">
                  <button
                    type="button"
                    onClick={() => {
                      setScheduleMode("SAME");
                      setSchedules((prev) => {
                        const next = { ...prev };
                        WEEKDAYS.forEach((day) => {
                          next[day] = { openTime: commonOpenTime, endTime: commonEndTime };
                        });
                        return next;
                      });
                    }}
                    className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      scheduleMode === "SAME"
                        ? "bg-white text-[#532C89] shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Same Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleMode("CUSTOM")}
                    className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      scheduleMode === "CUSTOM"
                        ? "bg-white text-[#532C89] shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Custom Hours
                  </button>
                </div>
              </div>

              {scheduleMode === "SAME" ? (
                <div className="bg-[#532C89]/5 border border-[#532C89]/10 rounded-xl p-3.5 space-y-3.5">
                  {/* Common time inputs */}
                  <div className="flex items-center gap-2">
                    <TimePicker
                      label="Open Time"
                      value={commonOpenTime}
                      onChange={(val) => updateCommonSchedule("openTime", val)}
                    />
                    <span className="text-xs text-gray-400 font-medium pt-4 shrink-0">to</span>
                    <TimePicker
                      label="Close Time"
                      value={commonEndTime}
                      onChange={(val) => updateCommonSchedule("endTime", val)}
                    />
                  </div>

                  {/* Day selection */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Active Days</label>
                    <div className="flex flex-wrap gap-1.5">
                      {WEEKDAYS.map((day) => {
                        const isActive = !!enabledDays[day];
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`flex-1 min-w-[50px] py-2 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                              isActive
                                ? "bg-[#532C89] text-white border-[#532C89] shadow-sm"
                                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700"
                            }`}
                          >
                            {day.charAt(0) + day.slice(1, 3).toLowerCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all ${
                        enabledDays[day] ? "border-[#532C89]/25 bg-[#532C89]/5" : "border-gray-100 bg-gray-50/60 opacity-60"
                      }`}
                    >
                      {/* Day toggle with Switch style */}
                      <div className="flex items-center gap-3 shrink-0 sm:w-32">
                        <button
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            enabledDays[day] ? "bg-[#532C89]" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              enabledDays[day] ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className={`text-xs font-bold capitalize ${enabledDays[day] ? "text-[#532C89]" : "text-gray-400"}`}>
                          {day.charAt(0) + day.slice(1).toLowerCase()}
                        </span>
                      </div>

                      {/* Time inputs */}
                      <div className="flex items-center gap-2 flex-1">
                        <TimePicker
                          disabled={!enabledDays[day]}
                          value={schedules[day].openTime}
                          onChange={(val) => updateSchedule(day, "openTime", val)}
                        />
                        <span className="text-xs text-gray-400 shrink-0">to</span>
                        <TimePicker
                          disabled={!enabledDays[day]}
                          value={schedules[day].endTime}
                          onChange={(val) => updateSchedule(day, "endTime", val)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
            className="px-6 py-2.5 bg-[#000000] hover:bg-[#1E2939] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shadow-sm hover:shadow-md"
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
