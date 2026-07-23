import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

const EditCategoryModal = ({ category, onClose, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: category?.name || "",
      type: category?.type === "GAME" ? "Games" : "Food",
    },
  });

  const onSubmit = async (data) => {
    // Show SweetAlert confirmation dialog
    Swal.fire({
      title: "Do you want to save the changes?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save",
      denyButtonText: `Don't save`,
      confirmButtonColor: "#000000", // Sleek dark/app color
      denyButtonColor: "#ef4444", // red for Don't save
      cancelButtonColor: "#6b7280", // gray for Cancel
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsSubmitting(true);
          await onSave({
            id: category._id || category.id,
            name: data.name.trim(),
            type: data.type === "Games" ? "GAME" : "FOOD",
          });
          Swal.fire("Saved!", "", "success");
          onClose();
        } catch (err) {
          console.error("Save Category Error:", err);
          const errMsg = err.response?.data?.message || err.message || "Failed to update category.";
          Swal.fire("Error", errMsg, "error");
        } finally {
          setIsSubmitting(false);
        }
      } else if (result.isDenied) {
        Swal.fire("Changes are not saved", "", "info");
        onClose();
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => {
        if (!isSubmitting && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-[20px] p-6 w-full max-w-[400px] shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Edit Category
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category Name
              </label>

              <input
                type="text"
                placeholder="Enter name"
                disabled={isSubmitting}
                {...register("name", {
                  required: "Category name is required",
                })}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#532C89] ${
                  errors.name
                    ? "border-red-500"
                    : "border-gray-200"
                }`}
              />

              {errors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type
              </label>

              <select
                disabled={isSubmitting}
                {...register("type")}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#532C89]"
              >
                <option value="Food">Food</option>
                <option value="Games">Games</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-gray-200 rounded-xl w-[120px] text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-black text-white rounded-xl w-[120px] flex items-center justify-center gap-2 hover:bg-gray-800 transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryModal;
