import React from "react";
import { useForm } from "react-hook-form";

// CreateCategoryModal matches the Figma design for creating a new category
const CreateCategoryModal = ({ onClose, onCreate }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      type: "Food",
    },
  });

  const onSubmit = (data) => {
    onCreate({ name: data.name.trim(), type: data.type, status: "Available" });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[20px] p-6 w-full max-w-[400px] shadow-lg animate-in fade-in zoom-in-95 duration-150">
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-5">Create Category</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Form Fields */}
          <div className="space-y-4 mb-6">
            {/* Category Name Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Category Name
              </label>
              <input
                type="text"
                placeholder="Enter name"
                {...register("name", { required: "Category name is required" })}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800 ${
                  errors.name ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            {/* Type Select Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Type
              </label>
              <select
                {...register("type")}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800 appearance-none cursor-pointer"
              >
                <option value="Food">Food</option>
                <option value="Games">Games</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-4">
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
    </div>
  );
};

export default CreateCategoryModal;
