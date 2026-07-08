import React, { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Camera } from "lucide-react";

const AddSubAdminModal = ({ isOpen, onClose, onSubmit }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Reset form and preview whenever modal opens
  useEffect(() => {
    if (isOpen) {
      reset();
      setImagePreview(null);
    }
  }, [isOpen, reset]);

  // Close on backdrop click
  const onBackdrop = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  // Show image preview when user picks a file
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const onFormSubmit = (data) => {
    onSubmit({ ...data, imageFile: fileInputRef.current?.files?.[0] || null });
    onClose();
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#532C89]/40 focus:border-[#532C89] transition-all placeholder:text-gray-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onBackdrop}
    >
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add Sub-Admin</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="px-6 py-5 space-y-5">

          {/* Name + Email row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">User Name</label>
              <input
                type="text"
                placeholder="Enter name"
                className={inputClass}
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Enter email"
                className={inputClass}
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          {/* Image upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Admin Image</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-[#532C89]/50 transition-all group overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-[#532C89] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gray-200 group-hover:bg-[#532C89]/10 flex items-center justify-center transition-colors">
                    <Camera size={18} />
                  </div>
                  <p className="text-sm font-semibold">Upload</p>
                  <p className="text-xs text-gray-400">(PDF, JPG, PNG)</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Admin Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              className={inputClass}
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-[#1a1a1a] text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubAdminModal;
