import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Upload, ImageIcon, Utensils } from "lucide-react";
import useAxiosSecure from "../../hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const FIELD = ({ label, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);

const inputCls = (err) =>
  `w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#532C89]/20 focus:border-[#532C89] text-gray-800 transition-all ${
    err ? "border-red-400" : "border-gray-200"
  }`;

const AddFoodModal = ({ onClose, onCreated }) => {
  const axiosSecure = useAxiosSecure();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    price: "",
    delivery_time: "",
    delivery_fee: "",
    short_description: "",
  });
  const [images, setImages] = useState([]); // Array of File objects
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Discount states matching Game page logic
  const [isDiscount, setIsDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("");

  const handleDiscountPercentChange = (val) => {
    setDiscountPercent(val);
    const numericValue = parseFloat(val);
    if (!isNaN(numericValue) && numericValue > 0) {
      setIsDiscount(true);
    } else {
      setIsDiscount(false);
    }
  };

  // Fetch food categories
  const { data: categories = [] } = useQuery({
    queryKey: ["foodCategories"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/category/getCategories?type=FOOD&limit=100");
      const b = res.data;
      if (Array.isArray(b?.data?.data)) return b.data.data;
      if (Array.isArray(b?.data)) return b.data;
      return [];
    },
  });

  // Fetch current admin's profile for createdById
  const { data: adminData } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/user/getMe");
      return res.data?.data ?? {};
    },
  });

  // Escape key closes modal
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Clean up preview URLs on unmount
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleFiles = (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!valid.length) return;
    setImages((p) => [...p, ...valid].slice(0, 5)); // max 5 images
    setPreviews((p) => [...p, ...valid.map(URL.createObjectURL)].slice(0, 5));
    setErrors((p) => ({ ...p, images: undefined }));
  };

  const removeImage = (idx) => {
    URL.revokeObjectURL(previews[idx]);
    setImages((p) => p.filter((_, i) => i !== idx));
    setPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Food name is required";
    if (!form.categoryId) e.categoryId = "Category is required";
    if (!form.price || isNaN(Number(form.price))) e.price = "Valid price is required";
    if (!form.delivery_time || isNaN(Number(form.delivery_time))) e.delivery_time = "Delivery time (mins) is required";
    if (!form.delivery_fee || isNaN(Number(form.delivery_fee))) e.delivery_fee = "Delivery fee is required";
    if (!images.length) e.images = "At least one image is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("categoryId", form.categoryId);
      fd.append("price", form.price);
      fd.append("delivery_time", form.delivery_time);
      fd.append("delivery_fee", form.delivery_fee);
      fd.append("short_description", form.short_description.trim());
      images.forEach((img) => fd.append("images", img));

      // Discount logic: backend field is 'isDisCount' (capital C) & 'disCountParcentage'
      const numericDiscount = parseFloat(discountPercent);
      const hasDiscount = isDiscount && !isNaN(numericDiscount) && numericDiscount > 0;
      // Send every casing variant — backend picks the one it recognises
      fd.append("isDisCount",      hasDiscount ? "true" : "");
      fd.append("isDiscount",      hasDiscount ? "true" : "");
      fd.append("disCountParcentage",  hasDiscount ? String(numericDiscount) : "");
      fd.append("discountParcentage",  hasDiscount ? String(numericDiscount) : "");
      fd.append("disCountPercentage",  hasDiscount ? String(numericDiscount) : "");
      fd.append("discountPercentage",  hasDiscount ? String(numericDiscount) : "");
      fd.append("disCountParcenTage",  hasDiscount ? String(numericDiscount) : "");
      fd.append("discountParcenTage",  hasDiscount ? String(numericDiscount) : "");

      const currentUserId = adminData?.id || adminData?._id || JSON.parse(localStorage.getItem("user") || "{}")?.id || JSON.parse(localStorage.getItem("user") || "{}")?._id;
      if (currentUserId) {
        fd.append("createdById", currentUserId);
      }

      const res = await axiosSecure.post("/api/foods/addFood", fd);
      const createdFood = res.data?.data || res.data;
      const createdId = createdFood?.id || createdFood?._id;

      if (createdId && hasDiscount) {
        // Sequentially PATCH to guarantee discount is persisted
        const patchFd = new FormData();
        patchFd.append("isDisCount",      "true");
        patchFd.append("isDiscount",      "true");
        patchFd.append("disCountParcentage",  String(numericDiscount));
        patchFd.append("discountParcentage",  String(numericDiscount));
        patchFd.append("disCountPercentage",  String(numericDiscount));
        patchFd.append("discountPercentage",  String(numericDiscount));
        patchFd.append("disCountParcenTage",  String(numericDiscount));
        patchFd.append("discountParcenTage",  String(numericDiscount));
        patchFd.append("delivery_time", form.delivery_time);
        patchFd.append("delivery_fee",  form.delivery_fee);
        images.forEach((img) => patchFd.append("images", img));
        await axiosSecure.patch(`/api/foods/updateFood/${createdId}`, patchFd);
      }

      toast.success(res.data?.message || "Food added successfully!");
      onCreated?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add food";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
            <div className="w-8 h-8 rounded-lg bg-[#532C89]/10 flex items-center justify-center">
              <Utensils size={16} className="text-[#532C89]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-none">Add New Food</h2>
              <p className="text-xs text-gray-400 mt-0.5">Fill in the details below</p>
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
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <form id="add-food-form" onSubmit={handleSubmit} className="space-y-4">

            {/* Name + Price */}
            <div className="grid grid-cols-2 gap-3">
              <FIELD label="Food Name" error={errors.name}>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={form.name}
                  onChange={set("name")}
                  className={inputCls(errors.name)}
                />
              </FIELD>
              <FIELD label="Food Price" error={errors.price}>
                <input
                  type="number"
                  placeholder="$0.00"
                  value={form.price}
                  onChange={set("price")}
                  min="0"
                  className={inputCls(errors.price)}
                />
              </FIELD>
            </div>

            {/* Food Image & Category / Discount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left: Image Upload */}
              <FIELD label="Food Image" error={errors.images}>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                  className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-[#532C89]/50 hover:bg-[#532C89]/3 h-[115px] ${
                    errors.images ? "border-red-400 bg-red-50/30" : "border-gray-200 bg-gray-50/50"
                  }`}
                >
                  <Upload size={22} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400 font-semibold">Upload</span>
                  <span className="text-[10px] text-gray-400">(PDF, JPG, PNG)</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
                />

                {/* Preview thumbnails */}
                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {previews.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={src}
                          alt={`preview-${idx}`}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    {previews.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-12 h-12 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#532C89]/50 hover:text-[#532C89] transition-all cursor-pointer"
                      >
                        <ImageIcon size={16} />
                      </button>
                    )}
                  </div>
                )}
              </FIELD>

              {/* Right: Category Select + Discount input */}
              <div className="flex flex-col gap-3">
                <FIELD label="Category" error={errors.categoryId}>
                  <select
                    value={form.categoryId}
                    onChange={set("categoryId")}
                    className={`${inputCls(errors.categoryId)} cursor-pointer`}
                  >
                    <option value="" disabled>Enter Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </FIELD>

                <FIELD label="Discount Percentage (%)">
                  <input
                    type="number"
                    placeholder="e.g. 10 (optional)"
                    value={discountPercent}
                    onChange={(e) => handleDiscountPercentChange(e.target.value)}
                    min="0"
                    max="100"
                    className={inputCls(false)}
                  />
                </FIELD>
              </div>
            </div>

            {/* Delivery Time & Delivery Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FIELD label="Delivery Time" error={errors.delivery_time}>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={form.delivery_time}
                  onChange={set("delivery_time")}
                  className={inputCls(errors.delivery_time)}
                />
              </FIELD>
              <FIELD label="Delivery Fee" error={errors.delivery_fee}>
                <input
                  type="text"
                  placeholder="$0.00"
                  value={form.delivery_fee}
                  onChange={set("delivery_fee")}
                  className={inputCls(errors.delivery_fee)}
                />
              </FIELD>
            </div>

            {/* Short Description */}
            <FIELD label="Short Description">
              <input
                type="text"
                placeholder="Enter Short Description"
                value={form.short_description}
                onChange={set("short_description")}
                className={inputCls(false)}
              />
            </FIELD>
          </form>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4 px-5 py-4 bg-gray-50/50 rounded-b-2xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors w-[120px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-food-form"
            disabled={loading}
            className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors w-[120px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            Create
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

export default AddFoodModal;
