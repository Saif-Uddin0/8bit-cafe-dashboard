import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useForm } from "react-hook-form";
import { X, Upload } from "lucide-react";

const AddFoodModal = ({ onClose, onCreate, categories = ["Snacks", "Drinks", "Meals"] }) => {
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
      deliveryTime: "30 Minutes",
      deliveryFee: "30 Tk",
      description: "",
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
    onCreate({
      name: data.name.trim(),
      category: data.category,
      deliveryTime: data.deliveryTime,
      deliveryFee: data.deliveryFee,
      price: data.price.endsWith("tk") ? data.price : `${data.price} tk`,
      description: data.description,
      status: "Available",
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
        className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl relative animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Food</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Food Name & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Food Name
              </label>
              <input
                type="text"
                placeholder="Enter name"
                {...register("name", { required: "Food name is required" })}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800 ${
                  errors.name ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Food Price
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

          {/* Food Image & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dashed Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Food Image
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors h-[110px]">
                <Upload className="text-gray-400 mb-1" size={22} />
                <span className="text-xs text-gray-400 font-semibold">Upload</span>
                <span className="text-[10px] text-gray-400">(PDF, JPG, PNG)</span>
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Category
              </label>
              <select
                {...register("category", { required: "Category is required" })}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800 appearance-none cursor-pointer"
              >
                <option value="" disabled>Enter Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery Time & Delivery Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Delivery Time
              </label>
              <input
                type="text"
                placeholder="Enter delivery time"
                {...register("deliveryTime")}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Delivery Fee
              </label>
              <input
                type="text"
                placeholder="$0.00"
                {...register("deliveryFee")}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800"
              />
            </div>
          </div>

          {/* Short Description */}
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

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4 mt-6">
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

export default AddFoodModal;
