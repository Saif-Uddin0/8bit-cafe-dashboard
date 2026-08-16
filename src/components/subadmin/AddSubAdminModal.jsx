import React, { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Camera } from "lucide-react";
import { toast } from "react-hot-toast";
import useAxiosSecure from "../../hooks/useAxios";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const AddSubAdminModal = ({ isOpen, onClose }) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
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
      setImageFile(null);
    }
  }, [isOpen, reset]);

  // Close on backdrop click
  const onBackdrop = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  // Handle image selection with type validation
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, or WebP images are allowed.");
      e.target.value = "";
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // TanStack Mutation — POST /api/user/createSuperAdmin
  const { mutate: createAdmin, isPending } = useMutation({
    mutationFn: async (formData) => {
      const fd = new FormData();
      fd.append("firstName", formData.firstName);
      fd.append("lastName", formData.lastName);
      fd.append("email", formData.email);
      fd.append("password", formData.password);
      fd.append("phone", formData.phone);
      if (imageFile) {
        fd.append("image", imageFile);
      }
      const res = await axiosSecure.post("/api/user/createSuperAdmin", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Sub-Admin created successfully!");
      queryClient.invalidateQueries({ queryKey: ["subAdmins"] });
      reset();
      setImagePreview(null);
      setImageFile(null);
      onClose();
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to create sub-admin.";
      toast.error(msg);
    },
  });

  if (!isOpen) return null;

  const inputClass =
    "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#532C89]/40 focus:border-[#532C89] transition-all placeholder:text-gray-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onBackdrop}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        style={{ maxHeight: "calc(100vh - 32px)", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Add Sub-Admin</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit((data) => createAdmin(data))} className="px-6 py-5 space-y-4">

          {/* First Name + Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">First Name</label>
              <input
                type="text"
                placeholder="John"
                className={inputClass}
                {...register("firstName", { required: "First name is required" })}
              />
              {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Last Name</label>
              <input
                type="text"
                placeholder="Smith"
                className={inputClass}
                {...register("lastName", { required: "Last name is required" })}
              />
              {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              placeholder="subadmin@example.com"
              autoComplete="off"
              className={inputClass}
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Phone</label>
            <input
              type="tel"
              placeholder="+880XXXXXXXXXX"
              className={inputClass}
              {...register("phone", { required: "Phone is required" })}
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              autoComplete="new-password"
              className={inputClass}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Min 6 characters",
                },
              })}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {/* Image upload (optional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Admin Image <span className="font-normal text-gray-400">(Optional — JPG, PNG, WebP)</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-28 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-[#532C89]/50 transition-all group overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-[#532C89] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gray-200 group-hover:bg-[#532C89]/10 flex items-center justify-center transition-colors">
                    <Camera size={18} />
                  </div>
                  <p className="text-sm font-semibold">Upload Photo</p>
                  <p className="text-xs text-gray-400">JPG, JPEG, PNG, WebP</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2.5 bg-[#1a1a1a] text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

export default AddSubAdminModal;
