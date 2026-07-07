import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useForm } from "react-hook-form";
import { X, Upload, Clock } from "lucide-react";

// List of weekdays to show in the Hours section
const WEEKDAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

const AddGameModal = ({ onClose, onCreate, categories = ["Games", "Food"] }) => {
  const modalRef = useRef(null);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      price: "",
      category: "",
      description: "",
      hours: WEEKDAYS.reduce((acc, day) => {
        acc[day] = { start: "12:12 Pm", end: "12:12 Pm" };
        return acc;
      }, {}),
      weekendText: "Friday",
    },
  });

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const onSubmit = (data) => {
    // Call onCreate with formatted values
    onCreate({
      name: data.name.trim(),
      duration: "30 Minutes", // default/mock
      price: `${data.price} tk`,
      status: "Available",
      category: data.category,
      description: data.description,
      hours: data.hours,
      weekendText: data.weekendText,
    });
    onClose();
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto py-10 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl relative animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Games</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Row 1: Game Name & Game Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Game Name
              </label>
              <input
                type="text"
                placeholder="Enter name"
                {...register("name", { required: "Game Name is required" })}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800 ${
                  errors.name ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Game Price
              </label>
              <input
                type="text"
                placeholder="$0.00"
                {...register("price", { required: "Price is required" })}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800 ${
                  errors.price ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            </div>
          </div>

          {/* Row 2: Game Image Upload & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Image Upload Box */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Game Image
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors h-[120px]">
                <Upload className="text-gray-400 mb-2" size={24} />
                <span className="text-xs text-gray-400 font-semibold">Upload</span>
                <span className="text-[10px] text-gray-400 mt-0.5">(PDF, JPG, PNG)</span>
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Category
              </label>
              <select
                {...register("category")}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800 appearance-none cursor-pointer"
              >
                <option value="" disabled>Enter Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Short Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Short Description
            </label>
            <input
              type="text"
              placeholder="Enter Short Description"
              {...register("description")}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800"
            />
          </div>

          {/* Hours Section Header */}
          <div className="flex items-center gap-1.5 border-t border-gray-100 pt-4 text-gray-800 font-bold text-sm">
            <Clock size={16} />
            <span>Hours</span>
          </div>

          {/* Weekday Hours Grid */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
            {WEEKDAYS.map((day) => (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-xs font-semibold text-gray-500 w-24">{day}</span>
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="text"
                    placeholder="12:12 Pm"
                    {...register(`hours.${day}.start`)}
                    className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black text-gray-700"
                  />
                  <input
                    type="text"
                    placeholder="12:12 Pm"
                    {...register(`hours.${day}.end`)}
                    className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black text-gray-700"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Weekend Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Weekend
            </label>
            <input
              type="text"
              placeholder="Friday"
              {...register("weekendText")}
              className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors w-[120px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors w-[120px]"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddGameModal;
