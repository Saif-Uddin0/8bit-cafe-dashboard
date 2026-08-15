import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Upload } from "lucide-react";

const CreateCategoryModal = ({ onClose, onCreate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Revoke object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await onCreate({
        ...data,
        file: imageFile,
      });
    } finally {
      setIsSubmitting(false);
    }
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
          Create Category
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
                className={`w-full px-4 py-2.5 border rounded-xl ${
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
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
              >
                <option value="Food">Food</option>
                <option value="Games">Games</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category Image
              </label>

              <div
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer ${
                  imagePreview
                    ? "border-transparent bg-gray-50"
                    : dragging
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-gray-400 bg-gray-50/50"
                }`}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" decoding="async" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isSubmitting}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-500 text-white rounded-full transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <Upload size={20} className="text-gray-400 mb-1.5" />
                    <span className="text-xs font-semibold text-gray-600">
                      {dragging ? "Drop to upload" : "Click or drag image here"}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Supports JPG, PNG, WEBP</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border rounded-xl w-[120px]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-black text-white rounded-xl w-[120px] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryModal;