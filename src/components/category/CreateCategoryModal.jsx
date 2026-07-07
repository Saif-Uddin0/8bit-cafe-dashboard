import React, { useState } from "react";

// CreateCategoryModal matches the Figma design for creating a new category
const CreateCategoryModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("Food"); // default to Food or empty

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), type, status: "Available" });
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800"
            />
          </div>

          {/* Type Select Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
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
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors w-[120px]"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors w-[120px]"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCategoryModal;
