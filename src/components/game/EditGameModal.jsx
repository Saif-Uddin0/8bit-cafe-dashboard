import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  X,
  Upload,
  Clock,
  Gamepad2,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle,
} from "lucide-react";

// ── Time helpers ─────────────────────────────────────────────────────────────
const normalizeTime = (timeStr) => {
  if (!timeStr) return "";
  const cleaned = timeStr.replace(/\s+/g, "").toUpperCase();
  const match = cleaned.match(/^(\d{1,2}):?(\d{2})(AM|PM)?$/) || cleaned.match(/^(\d{1,2})(AM|PM)$/);
  if (!match) return timeStr.trim();
  const hours = match[1];
  const minutes = match[2] || "00";
  const ampm = match[3] || "";
  if (ampm) return `${hours}:${minutes} ${ampm}`;
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

// ── TimePicker sub-component ─────────────────────────────────────────────────
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
          <button type="button" disabled={disabled} onClick={() => updateField("ampm", "AM")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${parsed.ampm === "AM" ? "bg-white text-[#532C89] shadow-sm" : "text-gray-400 hover:text-gray-700"}`}>
            AM
          </button>
          <button type="button" disabled={disabled} onClick={() => updateField("ampm", "PM")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${parsed.ampm === "PM" ? "bg-white text-[#532C89] shadow-sm" : "text-gray-400 hover:text-gray-700"}`}>
            PM
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Days the backend accepts ──────────────────────────────────────────────────
const WEEKDAYS = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const defaultSchedule = { openTime: "09:00 AM", endTime: "05:00 PM" };

// ── Main Component ────────────────────────────────────────────────────────────
const EditGameModal = ({ game, onClose, onUpdate, categories = [] }) => {
  const modalRef = useRef(null);
  const addFileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);

  const [name, setName] = useState(game?.name ?? "");
  const [description, setDescription] = useState(game?.description ?? "");
  const [categoryId, setCategoryId] = useState(
    game?.categoryId ?? game?.category?.id ?? ""
  );


  // IMAGES

  const [replacingId, setReplacingId] = useState(null);

  const [imagesList, setImagesList] = useState(() =>
    (game?.images || []).map((img, i) => ({
      id: `orig-${i}`,
      type: "existing",
      url: typeof img === "object" ? img?.url : img,
      publicId: typeof img === "object" ? img?.publicId : null,
      deleted: false,
    }))
  );

  const [deletedPublicIds, setDeletedPublicIds] = useState([]);

  useEffect(() => {
    const captured = imagesList;

    return () => {
      captured.forEach((img) => {
        if (img.type === "new" && img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, []);

  const handleAddFiles = (files) => {
    const valid = Array.from(files || []).filter((file) =>
      file.type.startsWith("image/")
    );

    if (!valid.length) return;

    const remaining = 10 - imagesList.length;

    const items = valid.slice(0, remaining).map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      type: "new",
      file,
      preview: URL.createObjectURL(file),
      deleted: false,
    }));

    setImagesList((prev) => [...prev, ...items]);
  };

  const deleteImage = (id) => {
    const target = imagesList.find((img) => img.id === id);

    if (
      target &&
      target.type === "existing" &&
      target.publicId
    ) {
      setDeletedPublicIds((prev) =>
        prev.includes(target.publicId)
          ? prev
          : [...prev, target.publicId]
      );
    }

    setImagesList((prev) =>
      prev
        .map((img) => {
          if (img.id !== id) return img;

          if (img.type === "new" && img.preview) {
            URL.revokeObjectURL(img.preview);
          }

          return img.type === "new"
            ? null
            : { ...img, deleted: true };
        })
        .filter(Boolean)
    );
  };

  const triggerReplace = (id) => {
    setReplacingId(id);

    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = "";
      replaceFileInputRef.current.click();
    }
  };

  const handleReplaceFile = (e) => {
    const file = e.target.files?.[0];

    if (!file || !replacingId) return;

    if (!file.type.startsWith("image/")) {
      setReplacingId(null);
      return;
    }

    const newItem = {
      id: `new-${Date.now()}`,
      type: "new",
      file,
      preview: URL.createObjectURL(file),
      deleted: false,
    };

    const target = imagesList.find(
      (img) => img.id === replacingId
    );

    if (
      target &&
      target.type === "existing" &&
      target.publicId
    ) {
      setDeletedPublicIds((prev) =>
        prev.includes(target.publicId)
          ? prev
          : [...prev, target.publicId]
      );
    }

    setImagesList((prev) =>
      prev.map((img) => {
        if (img.id !== replacingId) return img;

        if (img.type === "new" && img.preview) {
          URL.revokeObjectURL(img.preview);
        }

        return newItem;
      })
    );

    setReplacingId(null);
    e.target.value = "";
  };

  const visibleImages = imagesList.filter(
    (img) => !img.deleted
  );

  // PRICING

  const [slot30, setSlot30] = useState(
    game?.price30Min != null
  );

  const [slot60, setSlot60] = useState(
    game?.price60Min != null
  );

  const [price30Min, setPrice30Min] = useState(
    game?.price30Min ?? ""
  );

  const [price60Min, setPrice60Min] = useState(
    game?.price60Min ?? ""
  );

  // DISCOUNT

  const [isDiscount, setIsDiscount] = useState(
    game?.isDiscount ?? false
  );

  const [discountPercent, setDiscountPercent] = useState(
    game?.disCountParcenTage ??
      game?.discountParcenTage ??
      ""
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
      return;
    }

    const numericValue = parseFloat(discountPercent);

    if (isNaN(numericValue) || numericValue <= 0) {
      setDiscountPercent("");
    }
  };

  // STATUS


  const [status, setStatus] = useState(
    game?.status === "AVAILABLE" ||
      game?.status === "Available"
      ? "AVAILABLE"
      : "UNAVAILABLE"
  );

  const [enabledDays, setEnabledDays] = useState(() => {
    const map = {};

    WEEKDAYS.forEach((day) => {
      map[day] = false;
    });

    (game?.schedules ?? []).forEach((s) => {
      if (WEEKDAYS.includes(s.day)) {
        map[s.day] = true;
      }
    });

    return map;
  });

  const [schedules, setSchedules] = useState(() => {
    const map = {};

    WEEKDAYS.forEach((day) => {
      map[day] = { ...defaultSchedule };
    });

    (game?.schedules ?? []).forEach((s) => {
      if (WEEKDAYS.includes(s.day)) {
        map[s.day] = {
          openTime: normalizeTime(s.openTime),
          endTime: normalizeTime(s.endTime),
        };
      }
    });

    return map;
  });

  const [scheduleMode, setScheduleMode] = useState(() => {
    const activeDays = (game?.schedules ?? []).filter((s) =>
      WEEKDAYS.includes(s.day)
    );

    if (activeDays.length <= 1) return "SAME";

    const firstActive = activeDays[0];

    const isSame = activeDays.every(
      (s) =>
        normalizeTime(s.openTime) ===
          normalizeTime(firstActive.openTime) &&
        normalizeTime(s.endTime) ===
          normalizeTime(firstActive.endTime)
    );

    return isSame ? "SAME" : "CUSTOM";
  });

  const [commonOpenTime, setCommonOpenTime] = useState(() => {
    const activeDays = (game?.schedules ?? []).filter((s) =>
      WEEKDAYS.includes(s.day)
    );

    return activeDays.length > 0
      ? normalizeTime(activeDays[0].openTime)
      : "09:00 AM";
  });

  const [commonEndTime, setCommonEndTime] = useState(() => {
    const activeDays = (game?.schedules ?? []).filter((s) =>
      WEEKDAYS.includes(s.day)
    );

    return activeDays.length > 0
      ? normalizeTime(activeDays[0].endTime)
      : "05:00 PM";
  });

  const updateCommonSchedule = (field, value) => {
    if (field === "openTime") {
      setCommonOpenTime(value);
    }

    if (field === "endTime") {
      setCommonEndTime(value);
    }

    setSchedules((prev) => {
      const next = { ...prev };

      WEEKDAYS.forEach((day) => {
        next[day] = {
          ...next[day],
          [field]: value,
        };
      });

      return next;
    });
  };

  const toggleDay = (day) => {
    setEnabledDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const updateSchedule = (day, field, value) => {
    setSchedules((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !submitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, submitting]);

  const validate = () => {
    const errs = {};

    if (!name.trim()) {
      errs.name = "Game name is required";
    }

    if (!categoryId) {
      errs.categoryId = "Category is required";
    }

    if (!description.trim()) {
      errs.description = "Description is required";
    }

    if (!slot30 && !slot60) {
      errs.slots = "Select at least one time slot";
    }

    if (slot30 && !price30Min) {
      errs.price30Min = "Price for 30 min is required";
    }

    if (slot60 && !price60Min) {
      errs.price60Min = "Price for 60 min is required";
    }

    if (isDiscount) {
      const discount = parseFloat(discountPercent);

      if (
        isNaN(discount) ||
        discount <= 0 ||
        discount > 100
      ) {
        errs.discount = "Enter a discount between 1% and 100%";
      }
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      return;
    }

    const schedulesArray = WEEKDAYS
      .filter((day) => enabledDays[day])
      .map((day) => ({
        day,
        openTime: formatTimeToISO(
          schedules[day].openTime
        ),
        endTime: formatTimeToISO(
          schedules[day].endTime
        ),
      }));

    const formData = new FormData();

    formData.append("name", name.trim());
    formData.append(
      "description",
      description.trim()
    );
    formData.append("categoryId", categoryId);

    visibleImages.forEach((img) => {
      if (img.type === "new") {
        formData.append("images", img.file);
      }
    });

    if (deletedPublicIds.length > 0) {
      formData.append(
        "deletePublicIds",
        JSON.stringify(deletedPublicIds)
      );
    }

    const numericDiscount =
      parseFloat(discountPercent);

    const hasDiscount =
      isDiscount &&
      !isNaN(numericDiscount) &&
      numericDiscount > 0;

    formData.append(
      "isDiscount",
      hasDiscount ? "true" : "false"
    );

    formData.append(
      "disCountParcenTage",
      hasDiscount ? String(numericDiscount) : "0"
    );

    formData.append(
      "discountParcenTage",
      hasDiscount ? String(numericDiscount) : "0"
    );

    if (slot30 && price30Min) {
      formData.append("price30Min", price30Min);
    }

    if (slot60 && price60Min) {
      formData.append("price60Min", price60Min);
    }

    formData.append(
      "schedules",
      JSON.stringify(schedulesArray)
    );

    formData.append("status", status);

    setSubmitting(true);

    try {
      await onUpdate(game.id, formData);
      onClose();
    } catch {
      // handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  // UI

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5"
      onClick={(e) => {
        if (
          e.target === e.currentTarget &&
          !submitting
        ) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          maxHeight: "calc(100vh - 32px)",
          animation: "modalIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}

        <div className="px-5 py-4 border-b border-gray-100 shrink-0 bg-white">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#532C89]/10 flex items-center justify-center shrink-0">
                <Gamepad2
                  size={19}
                  className="text-[#532C89]"
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-900">
                  Edit Game
                </h2>

                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  Update game information, pricing and availability
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close modal"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* BODY */}

        <div className="overflow-y-auto flex-1 px-5 py-5">
          <form
            onSubmit={handleSubmit}
            id="edit-game-form"
            className="space-y-6"
          >

            {/* BASIC INFORMATION */}

            <section>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Basic Information
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Update the game's name, category and description.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Game Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter game name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) {
                        setErrors((prev) => ({
                          ...prev,
                          name: undefined,
                        }));
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#532C89]/20 focus:border-[#532C89] focus:bg-white text-gray-800 transition-all placeholder:text-gray-400 ${
                      errors.name
                        ? "border-red-400 bg-red-50/50"
                        : "border-gray-200"
                    }`}
                  />

                  {errors.name && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Category
                  </label>

                  <select
                    value={categoryId}
                    onChange={(e) =>
                      setCategoryId(e.target.value)
                    }
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#532C89]/20 focus:border-[#532C89] focus:bg-white text-gray-800 transition-all cursor-pointer ${
                      errors.categoryId
                        ? "border-red-400 bg-red-50/50"
                        : "border-gray-200"
                    }`}
                  >
                    <option value="" disabled>
                      Select category
                    </option>

                    {categories.map((cat) => (
                      <option
                        key={cat.id}
                        value={cat.id}
                      >
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  {errors.categoryId && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {errors.categoryId}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mt-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Description
                </label>

                <textarea
                  rows={3}
                  placeholder="Describe this game..."
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#532C89]/20 focus:border-[#532C89] focus:bg-white text-gray-800 resize-none transition-all placeholder:text-gray-400 ${
                    errors.description
                      ? "border-red-400 bg-red-50/50"
                      : "border-gray-200"
                  }`}
                />

                {errors.description && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </section>

            {/* IMAGES */}

            <section>
              <div className="flex items-end justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Game Images
                  </h3>

                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Manage images for this game.
                  </p>
                </div>

                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                  {visibleImages.length}/10
                </span>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3.5">
                <div className="flex flex-wrap gap-2.5">
                  {visibleImages.map((item) => {
                    const src =
                      item.type === "existing"
                        ? item.url
                        : item.preview;

                    return (
                      <div
                        key={item.id}
                        className="relative group w-[78px] h-[78px] rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm shrink-0"
                      >
                        <img
                          src={src}
                          alt="game"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() =>
                              triggerReplace(item.id)
                            }
                            title="Replace image"
                            className="w-7 h-7 rounded-lg bg-white/95 hover:bg-white flex items-center justify-center text-gray-700 cursor-pointer shadow"
                          >
                            <RefreshCw size={12} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteImage(item.id)
                            }
                            title="Delete image"
                            className="w-7 h-7 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center text-white cursor-pointer shadow"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {item.type === "new" && (
                          <span className="absolute left-1 bottom-1 bg-[#532C89] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">
                            NEW
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Add image */}
                  {visibleImages.length < 10 && (
                    <button
                      type="button"
                      onClick={() =>
                        addFileInputRef.current?.click()
                      }
                      className="w-[78px] h-[78px] rounded-xl border-2 border-dashed border-gray-300 hover:border-[#532C89]/60 hover:bg-[#532C89]/5 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-[#532C89] transition-all cursor-pointer"
                    >
                      <Plus size={20} />
                      <span className="text-[9px] font-bold">
                        ADD
                      </span>
                    </button>
                  )}
                </div>

                {/* Upload */}
                <div
                  onClick={() =>
                    addFileInputRef.current?.click()
                  }
                  onDragOver={(e) =>
                    e.preventDefault()
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    handleAddFiles(
                      e.dataTransfer.files
                    );
                  }}
                  className="mt-3 border border-dashed border-gray-300 hover:border-[#532C89]/50 hover:bg-white rounded-xl py-3 flex items-center justify-center gap-2 cursor-pointer transition-all text-gray-400 hover:text-[#532C89]"
                >
                  <Upload size={15} />

                  <span className="text-xs font-semibold">
                    Click or drag to upload images
                  </span>
                </div>

                <p className="text-[10px] text-gray-400 mt-2">
                  JPG, PNG or WEBP · Maximum 10 images
                </p>
              </div>
            </section>

            {/* PRICING */}

            <section>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Pricing
                </h3>

                <p className="text-[11px] text-gray-400 mt-0.5">
                  Configure the available booking durations and prices.
                </p>
              </div>

              {errors.slots && (
                <div className="mb-2.5 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-[11px] text-red-500">
                  {errors.slots}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 30 MIN */}
                <div
                  className={`rounded-xl border p-3.5 transition-all ${
                    slot30
                      ? "border-[#532C89]/40 bg-[#532C89]/5"
                      : "border-gray-200 bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slot30}
                        onChange={(e) =>
                          setSlot30(e.target.checked)
                        }
                        className="w-4 h-4 rounded accent-[#532C89] cursor-pointer"
                      />

                      <span className="text-sm font-bold text-gray-800">
                        30 Minutes
                      </span>
                    </label>

                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      Short
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                      ৳
                    </span>

                    <input
                      type="number"
                      min="0"
                      placeholder="Enter price"
                      disabled={!slot30}
                      value={price30Min}
                      onChange={(e) =>
                        setPrice30Min(e.target.value)
                      }
                      className={`w-full pl-8 pr-3 py-2.5 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#532C89]/20 focus:border-[#532C89] text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white transition-all ${
                        errors.price30Min
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    />
                  </div>

                  {errors.price30Min && (
                    <p className="text-[11px] text-red-500 mt-1.5">
                      {errors.price30Min}
                    </p>
                  )}
                </div>

                {/* 60 MIN */}
                <div
                  className={`rounded-xl border p-3.5 transition-all ${
                    slot60
                      ? "border-[#532C89]/40 bg-[#532C89]/5"
                      : "border-gray-200 bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slot60}
                        onChange={(e) =>
                          setSlot60(e.target.checked)
                        }
                        className="w-4 h-4 rounded accent-[#532C89] cursor-pointer"
                      />

                      <span className="text-sm font-bold text-gray-800">
                        60 Minutes
                      </span>
                    </label>

                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      Full
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                      ৳
                    </span>

                    <input
                      type="number"
                      min="0"
                      placeholder="Enter price"
                      disabled={!slot60}
                      value={price60Min}
                      onChange={(e) =>
                        setPrice60Min(e.target.value)
                      }
                      className={`w-full pl-8 pr-3 py-2.5 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#532C89]/20 focus:border-[#532C89] text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white transition-all ${
                        errors.price60Min
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    />
                  </div>

                  {errors.price60Min && (
                    <p className="text-[11px] text-red-500 mt-1.5">
                      {errors.price60Min}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* DISCOUNT */}

            <section>
              <div
                className={`rounded-xl border p-3.5 transition-all ${
                  isDiscount
                    ? "border-amber-200 bg-amber-50/60"
                    : "border-gray-200 bg-gray-50/50"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={isDiscount}
                      onChange={(e) =>
                        handleIsDiscountChange(
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 rounded accent-[#532C89] cursor-pointer"
                    />

                    <span className="text-sm font-bold text-gray-800">
                      Apply Discount
                    </span>
                  </label>

                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Discount percentage"
                      disabled={!isDiscount}
                      value={discountPercent}
                      onChange={(e) =>
                        handleDiscountPercentChange(
                          e.target.value
                        )
                      }
                      className={`w-full px-3.5 py-2.5 pr-10 bg-white border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#532C89]/20 focus:border-[#532C89] text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all ${
                        errors.discount
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                      %
                    </span>
                  </div>
                </div>

                {errors.discount && (
                  <p className="text-[11px] text-red-500 mt-1.5">
                    {errors.discount}
                  </p>
                )}

                {isDiscount && discountPercent && (
                  <div className="mt-2.5 text-[11px] text-amber-700">
                    Customers will receive{" "}
                    <strong>
                      {discountPercent}% off
                    </strong>{" "}
                    the selected game price.
                  </div>
                )}
              </div>
            </section>

            {/* STATUS */}

            <section>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Availability
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Control whether customers can book this game.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    value: "AVAILABLE",
                    label: "Available",
                    description:
                      "Customers can book",
                    active:
                      "border-green-300 bg-green-50 text-green-700",
                  },
                  {
                    value: "UNAVAILABLE",
                    label: "Unavailable",
                    description:
                      "Booking is disabled",
                    active:
                      "border-red-300 bg-red-50 text-red-700",
                  },
                ].map((item) => {
                  const active =
                    status === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        setStatus(item.value)
                      }
                      className={`flex items-center justify-between text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        active
                          ? item.active
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold">
                          {item.label}
                        </p>

                        <p
                          className={`text-[10px] mt-0.5 ${
                            active
                              ? "opacity-70"
                              : "text-gray-400"
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>

                      {active && (
                        <CheckCircle
                          size={17}
                          className="shrink-0"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
            {/* OPERATING HOURS */}


            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Clock
                      size={15}
                      className="text-[#532C89]"
                    />
                    Operating Hours
                  </h3>

                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Set when this game is available for booking.
                  </p>
                </div>

                <div className="flex p-0.5 bg-gray-100 rounded-lg border border-gray-200/70 self-start">
                  <button
                    type="button"
                    onClick={() => {
                      setScheduleMode("SAME");

                      setSchedules((prev) => {
                        const next = {
                          ...prev,
                        };

                        WEEKDAYS.forEach((day) => {
                          next[day] = {
                            openTime:
                              commonOpenTime,
                            endTime:
                              commonEndTime,
                          };
                        });

                        return next;
                      });
                    }}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      scheduleMode === "SAME"
                        ? "bg-white text-[#532C89] shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Same Hours
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setScheduleMode("CUSTOM")
                    }
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      scheduleMode === "CUSTOM"
                        ? "bg-white text-[#532C89] shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Custom Hours
                  </button>
                </div>
              </div>

              {/* SAME HOURS */}
              {scheduleMode === "SAME" ? (
                <div className="rounded-xl border border-[#532C89]/15 bg-[#532C89]/5 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-2.5">
                    <TimePicker
                      label="Open Time"
                      value={commonOpenTime}
                      onChange={(val) =>
                        updateCommonSchedule(
                          "openTime",
                          val
                        )
                      }
                    />

                    <span className="hidden sm:block text-xs text-gray-400 font-medium pb-3">
                      to
                    </span>

                    <TimePicker
                      label="Close Time"
                      value={commonEndTime}
                      onChange={(val) =>
                        updateCommonSchedule(
                          "endTime",
                          val
                        )
                      }
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Active Days
                    </label>

                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                      {WEEKDAYS.map((day) => {
                        const active =
                          !!enabledDays[day];

                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() =>
                              toggleDay(day)
                            }
                            className={`py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              active
                                ? "bg-[#532C89] text-white border-[#532C89] shadow-sm"
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* CUSTOM HOURS */
                <div className="space-y-2">
                  {WEEKDAYS.map((day) => {
                    const active =
                      !!enabledDays[day];

                    return (
                      <div
                        key={day}
                        className={`rounded-xl border p-3 transition-all ${
                          active
                            ? "border-[#532C89]/20 bg-[#532C89]/5"
                            : "border-gray-200 bg-gray-50/60"
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                          {/* Day */}
                          <div className="flex items-center gap-2.5 lg:w-28 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                toggleDay(day)
                              }
                              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer ${
                                active
                                  ? "bg-[#532C89]"
                                  : "bg-gray-200"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                  active
                                    ? "translate-x-4"
                                    : "translate-x-0"
                                }`}
                              />
                            </button>

                            <span
                              className={`text-xs font-bold ${
                                active
                                  ? "text-[#532C89]"
                                  : "text-gray-400"
                              }`}
                            >
                              {day.charAt(0) +
                                day
                                  .slice(1)
                                  .toLowerCase()}
                            </span>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-2 flex-1">
                            <TimePicker
                              disabled={!active}
                              value={
                                schedules[day]
                                  .openTime
                              }
                              onChange={(val) =>
                                updateSchedule(
                                  day,
                                  "openTime",
                                  val
                                )
                              }
                            />

                            <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                              TO
                            </span>

                            <TimePicker
                              disabled={!active}
                              value={
                                schedules[day]
                                  .endTime
                              }
                              onChange={(val) =>
                                updateSchedule(
                                  day,
                                  "endTime",
                                  val
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </form>
        </div>

        {/* FOOTER */}

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/70 shrink-0">
          <p className="hidden sm:block text-[10px] text-gray-400">
            Changes will be saved to this game.
          </p>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-white hover:border-gray-400 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="edit-game-form"
              disabled={submitting}
              className="px-6 py-2.5 bg-black hover:bg-[#1E2939] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              {submitting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
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
      </div>

      {/* HIDDEN FILE INPUTS */}


      <input
        ref={addFileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleAddFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceFile}
      />

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

export default EditGameModal;