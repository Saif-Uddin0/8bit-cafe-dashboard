import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Upload, Utensils, Trash2, RefreshCw, Plus, CheckCircle } from "lucide-react";
import useAxiosSecure from "../../hooks/useAxios";
import { toast } from "react-hot-toast";

// ── Food status values matching backend exactly ──────────────────────────────────
const FOOD_STATUSES = [
  { value: "AVAILABLE",    label: "Available",   color: "text-green-600 bg-green-50 border-green-200" },
  { value: "Un-available", label: "Unavailable", color: "text-red-600   bg-red-50   border-red-200"   },
];

const FIELD = ({ label, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);

const inputCls = (err) =>
  `w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2
   focus:ring-[#532C89]/20 focus:border-[#532C89] text-gray-800 transition-all ${
    err ? "border-red-400" : "border-gray-200"
  }`;

// ── Main component ───────────────────────────────────────────────────────────────
const EditFoodModal = ({ food, onClose, onUpdated }) => {
  const axiosSecure         = useAxiosSecure();
  const addFileInputRef     = useRef(null);   
  const replaceFileInputRef = useRef(null);  
  const [replacingId, setReplacingId] = useState(null); 

  // ── Scalar fields ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    delivery_time: food?.delivery_time ?? food?.deliveryTime ?? "",
    delivery_fee:  food?.delivery_fee  ?? food?.deliveryFee  ?? "",
    status:        food?.status        ?? "AVAILABLE",
  });

  // ── Discount ──────────────────────────────────────────────────────────────────
  const [isDiscount, setIsDiscount] = useState(
    food?.isDisCount ?? food?.isDiscount ?? false
  );
  const [discountPercent, setDiscountPercent] = useState(
    food?.disCountParcentage ?? food?.discountParcentage ??
    food?.discountPercentage ?? food?.discountParcenTage ?? ""
  );

  
  const [imagesList, setImagesList] = useState(() =>
    (food?.images || []).map((img, i) => ({
      id:      `orig-${i}`,
      type:    "existing",
      url:     typeof img === "object" ? img?.url : img,
      deleted: false,
    }))
  );

  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  // Revoke blob URLs on unmount
  useEffect(() => {
    const captured = imagesList;
    return () => {
      captured.forEach((img) => {
        if (img.type === "new" && img.preview) URL.revokeObjectURL(img.preview);
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key + body-scroll lock
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const setField = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleDiscountChange = (val) => {
    setDiscountPercent(val);
    const n = parseFloat(val);
    setIsDiscount(!isNaN(n) && n > 0);
  };

  const handleDiscountToggle = (checked) => {
    setIsDiscount(checked);
    if (!checked) setDiscountPercent("0");
  };

  // Add new image files
  const handleAddFiles = (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!valid.length) return;
    const items = valid.map((file, idx) => ({
      id:      `new-${Date.now()}-${idx}`,
      type:    "new",
      file,
      preview: URL.createObjectURL(file),
      deleted: false,
    }));
    setImagesList((prev) => {
      const next = [...prev, ...items];
      return next.slice(0, 10); // max 10
    });
    setErrors((e) => ({ ...e, images: undefined }));
  };

  // Soft-delete: mark deleted so it's excluded from the PATCH payload
  const deleteImage = (id) => {
    setImagesList((prev) =>
      prev.map((img) => {
        if (img.id !== id) return img;
        if (img.type === "new" && img.preview) URL.revokeObjectURL(img.preview);
        return img.type === "new" ? null : { ...img, deleted: true };
      }).filter(Boolean)
    );
  };

  // Trigger the replace file picker for a specific image id
  const triggerReplace = (id) => {
    setReplacingId(id);
    replaceFileInputRef.current.value = "";
    replaceFileInputRef.current.click();
  };

  const handleReplaceFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !replacingId) return;

    const newItem = {
      id:      `new-${Date.now()}`,
      type:    "new",
      file,
      preview: URL.createObjectURL(file),
      deleted: false,
    };

    setImagesList((prev) =>
      prev.map((img) => {
        if (img.id !== replacingId) return img;
        if (img.type === "new" && img.preview) URL.revokeObjectURL(img.preview);
        return newItem;
      })
    );
    setReplacingId(null);
    e.target.value = "";
  };

  // Visible = not deleted
  const visibleImages = imagesList.filter((img) => !img.deleted);

  // ── Validation ────────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.delivery_time || isNaN(Number(form.delivery_time)))
      e.delivery_time = "Delivery time (mins) is required";
    if (!form.delivery_fee || isNaN(Number(form.delivery_fee)))
      e.delivery_fee = "Delivery fee is required";
    if (isDiscount && (!discountPercent || isNaN(Number(discountPercent))))
      e.discountPercentage = "Enter a valid discount percentage";
    if (visibleImages.length === 0)
      e.images = "At least one image is required";
    return e;
  };

  // ── PATCH payload ─────────────────────────────────────────────────────────────
  const buildPayload = () => {
    const fd = new FormData();

    fd.append("delivery_time", form.delivery_time);
    fd.append("delivery_fee",  form.delivery_fee);
    fd.append("status",        form.status);

    // Discount
    const n         = parseFloat(discountPercent);
    const hasDisc   = isDiscount && !isNaN(n) && n > 0;
    fd.append("isDisCount",         hasDisc ? "true" : "false");
    fd.append("isDiscount",         hasDisc ? "true" : "false");
    fd.append("disCountParcentage", hasDisc ? String(n) : "0");
    fd.append("discountParcentage", hasDisc ? String(n) : "0");
    fd.append("disCountPercentage", hasDisc ? String(n) : "0");
    fd.append("discountPercentage", hasDisc ? String(n) : "0");
    fd.append("disCountParcenTage", hasDisc ? String(n) : "0");
    fd.append("discountParcenTage", hasDisc ? String(n) : "0");

    // Images — ALWAYS send the complete final set so backend knows what to keep.
    // Existing images are sent as URL strings; new images are sent as File blobs.
    visibleImages.forEach((img) => {
      if (img.type === "existing") fd.append("images", img.url);
      else                          fd.append("images", img.file);
    });

    return fd;
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const fd  = buildPayload();
      const res = await axiosSecure.patch(
        `/api/foods/updateFood/${food?.id ?? food?._id}`,
        fd
      );
      toast.success(res.data?.message || "Food updated successfully!");
      onUpdated?.(); // parent refetches + closes modal
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update food");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
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
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#532C89]/10 flex items-center justify-center">
              <Utensils size={16} className="text-[#532C89]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-none truncate max-w-[260px]">
                Edit — {food?.name}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Update food details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <form id="edit-food-form" onSubmit={handleSubmit} className="space-y-4">

            {/* Delivery Time + Fee */}
            <div className="grid grid-cols-2 gap-3">
              <FIELD label="Delivery Time (mins)" error={errors.delivery_time}>
                <input
                  type="number"
                  placeholder="e.g. 30"
                  value={form.delivery_time}
                  onChange={setField("delivery_time")}
                  min="1"
                  className={inputCls(errors.delivery_time)}
                />
              </FIELD>
              <FIELD label="Delivery Fee (৳)" error={errors.delivery_fee}>
                <input
                  type="number"
                  placeholder="e.g. 40"
                  value={form.delivery_fee}
                  onChange={setField("delivery_fee")}
                  min="0"
                  className={inputCls(errors.delivery_fee)}
                />
              </FIELD>
            </div>

            {/* Status */}
            <FIELD label="Status">
              <div className="grid grid-cols-2 gap-2">
                {FOOD_STATUSES.map((s) => {
                  const active = form.status === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, status: s.value }))}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                        active
                          ? `${s.color} ring-2 ring-offset-1 ring-current`
                          : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <span>{s.label}</span>
                      {active && <CheckCircle size={15} className="shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </FIELD>

            {/* Discount toggle */}
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isDiscount}
                  onChange={(e) => handleDiscountToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#532C89] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:translate-x-5" />
              </label>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700">Apply Discount</p>
                <p className="text-xs text-gray-400">Enable to set a discount percentage</p>
              </div>
              {isDiscount && discountPercent && !isNaN(Number(discountPercent)) && Number(discountPercent) > 0 && (
                <span className="text-xs font-bold text-[#532C89] bg-[#532C89]/10 px-2 py-1 rounded-lg shrink-0">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {isDiscount && (
              <FIELD label="Discount Percentage (%)" error={errors.discountPercentage}>
                <input
                  type="number"
                  placeholder="e.g. 20"
                  value={discountPercent}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  min="1"
                  max="100"
                  className={inputCls(errors.discountPercentage)}
                />
              </FIELD>
            )}

            {/* ── Image Management ──────────────────────────────────────────────── */}
            <FIELD label={`Images (${visibleImages.length})`} error={errors.images}>

              {/* Grid of current images */}
              <div className="flex flex-wrap gap-2.5">
                {visibleImages.map((item) => {
                  const src = item.type === "existing" ? item.url : item.preview;
                  return (
                    <div
                      key={item.id}
                      className="relative group w-[72px] h-[72px] rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm shrink-0"
                    >
                      <img
                        src={src}
                        alt="food"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />

                      {/* Hover overlay: Replace + Delete */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => triggerReplace(item.id)}
                          title="Replace"
                          className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white flex items-center justify-center text-gray-700 cursor-pointer shadow transition"
                        >
                          <RefreshCw size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteImage(item.id)}
                          title="Delete"
                          className="w-7 h-7 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center text-white cursor-pointer shadow transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* NEW badge */}
                      {item.type === "new" && (
                        <span className="absolute bottom-1 left-1 text-[8px] font-bold bg-[#532C89] text-white px-1 rounded leading-tight pointer-events-none">
                          NEW
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* ＋ Add tile — always visible if under 10 */}
                {visibleImages.length < 10 && (
                  <button
                    type="button"
                    onClick={() => addFileInputRef.current?.click()}
                    className="w-[72px] h-[72px] rounded-xl border-2 border-dashed border-gray-300 hover:border-[#532C89]/60 hover:bg-[#532C89]/5 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-[#532C89] transition-all cursor-pointer shrink-0"
                  >
                    <Plus size={20} />
                    <span className="text-[9px] font-bold leading-none">ADD</span>
                  </button>
                )}
              </div>

              {/* Empty state when all images removed */}
              {visibleImages.length === 0 && (
                <div
                  onClick={() => addFileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleAddFiles(e.dataTransfer.files); }}
                  className="border-2 border-dashed border-red-300 rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#532C89]/50 bg-red-50/40 mt-1"
                >
                  <Upload size={20} className="text-red-400" />
                  <p className="text-xs font-semibold text-red-500">No images — add at least one</p>
                  <p className="text-[10px] text-gray-400">JPG, PNG, WEBP</p>
                </div>
              )}

              <p className="text-[10px] text-gray-400 mt-0.5">
                Hover an image to replace or delete. Click <strong>ADD</strong> to upload more.
              </p>
            </FIELD>

            {/* Full-width drag-and-drop zone */}
            <div
              onClick={() => addFileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleAddFiles(e.dataTransfer.files); }}
              className="border-2 border-dashed border-gray-200 hover:border-[#532C89]/50 hover:bg-[#532C89]/3 rounded-xl py-3 flex items-center justify-center gap-2 cursor-pointer transition-all text-gray-400 hover:text-[#532C89]"
            >
              <Upload size={15} />
              <span className="text-xs font-semibold">Click or drag to upload images</span>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-food-form"
            disabled={loading}
            className="px-6 py-2.5 bg-[#532C89] hover:bg-[#6C04D7] text-white rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Utensils size={14} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Hidden file inputs ──────────────────────────────────────────────────
           MUST be outside the scrollable container so they aren't clipped, but
           still inside the portal so they're accessible.                        */}
      <input
        ref={addFileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { handleAddFiles(e.target.files); e.target.value = ""; }}
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
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default EditFoodModal;
