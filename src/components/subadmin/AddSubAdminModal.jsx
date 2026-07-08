import React, { useState, useRef, useEffect } from "react";
import { X, Camera } from "lucide-react";

const AddSubAdminModal = ({ isOpen, onClose, onSubmit }) => {
  // Form field states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Reset form fields whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setName("");
      setEmail("");
      setPassword("");
      setImageFile(null);
      setImagePreview(null);
    }
  }, [isOpen]);

  // Close modal when clicking on the backdrop overlay
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Handle image file selection and generate a preview URL
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    onSubmit({ name, email, password, imageFile });
    onClose();
  };

  if (!isOpen) return null;

  return (
    // Full-screen backdrop overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={handleBackdropClick}
    >
      {/* Modal Card */}
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add Sub-Admin</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Row 1: User Name + Email */}
          <div className="grid grid-cols-2 gap-4">
            {/* User Name Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                User Name
              </label>
              <input
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#532C89]/40 focus:border-[#532C89] transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#532C89]/40 focus:border-[#532C89] transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Row 2: Admin Image Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Admin Image
            </label>

            {/* Upload Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-[#532C89]/50 transition-all group"
            >
              {imagePreview ? (
                // Show preview when image is selected
                <img
                  src={imagePreview}
                  alt="Admin preview"
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                // Default upload placeholder
                <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-[#532C89] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gray-200 group-hover:bg-[#532C89]/10 flex items-center justify-center transition-colors">
                    <Camera size={20} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">Upload</p>
                    <p className="text-xs text-gray-400">(PDF, JPG, PNG)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Row 3: Admin Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Admin Password
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#532C89]/40 focus:border-[#532C89] transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Row 4: Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Cancel button */}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            {/* Create / Submit button */}
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
