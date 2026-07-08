import React, { useState, useRef, useEffect } from "react";
import { Pencil, Check, X, ImageIcon, Upload } from "lucide-react";

// ── Shared primitives (local to this file) ─────────────────────────────────────

const Card = ({ children }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    {children}
  </div>
);

const EditHeader = ({ title, isEditing, onEdit, onSave, onCancel }) => (
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-base font-bold text-gray-900">{title}</h2>
    <div className="flex items-center gap-2">
      {isEditing ? (
        <>
          <button onClick={onSave} title="Save"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#532C89] text-white hover:bg-[#6C04D7] transition-colors">
            <Check size={15} />
          </button>
          <button onClick={onCancel} title="Cancel"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <X size={15} />
          </button>
        </>
      ) : (
        <button onClick={onEdit} title="Edit"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <Pencil size={15} />
        </button>
      )}
    </div>
  </div>
);


const UploadSlot = ({ srcUrl, isEditing, onChange }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const process = (file) => {
    if (!file) return;
    const url = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    onChange({ file, url });
  };

  const handleInputChange = (e) => {
    process(e.target.files[0]);
    e.target.value = ""; // allow re-picking same file
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange({ file: null, url: null });
  };

  const handleClick = () => isEditing && inputRef.current?.click();

  const handleDragOver  = (e) => { if (!isEditing) return; e.preventDefault(); setDragging(true); };
  const handleDragLeave = ()  => setDragging(false);
  const handleDrop = (e) => {
    if (!isEditing) return;
    e.preventDefault();
    setDragging(false);
    process(e.dataTransfer.files[0]);
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-200
        ${srcUrl
          ? "border-transparent"
          : isEditing
            ? `border-dashed ${dragging ? "border-[#532C89] bg-[#532C89]/10" : "border-gray-300 bg-gray-50 hover:border-[#532C89] hover:bg-[#532C89]/5"} cursor-pointer`
            : "border-dashed border-gray-200 bg-gray-50/60 cursor-default"
        }`}
    >
      {srcUrl ? (
        <>
          {/* Preview */}
          <img src={srcUrl} alt="Banner" className="w-full h-full object-cover" />

          {/* Hover overlay while editing */}
          {isEditing && (
            <div className="absolute inset-0 bg-black/0 hover:bg-black/35 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none">
              <div className="flex flex-col items-center gap-1 text-white">
                <Upload size={20} />
                <span className="text-xs font-medium">Change image</span>
              </div>
            </div>
          )}

          {/* Remove button */}
          {isEditing && (
            <button
              onClick={handleRemove}
              title="Remove image"
              className="absolute top-2 right-2 z-10 w-6 h-6 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </>
      ) : (
        /* Empty placeholder */
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 select-none">
          <ImageIcon size={22} className={isEditing ? "text-gray-400" : "text-gray-300"} />
          <div className="text-center">
            <p className={`text-xs font-medium ${isEditing ? "text-gray-500" : "text-gray-400"}`}>
              {isEditing ? "Click or drag to upload" : "Upload"}
            </p>
            <p className="text-[10px] text-gray-400">(PDF, JPG, PNG)</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────────
const SLOT_COUNT = 3;
const emptySlots = () => Array.from({ length: SLOT_COUNT }, () => ({ file: null, url: null }));

const PromoBannerSection = ({ onSave }) => {
  const [saved,     setSaved]     = useState(emptySlots());
  const [draft,     setDraft]     = useState(emptySlots());
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit   = () => { setDraft(saved.map((s) => ({ ...s }))); setIsEditing(true); };
  const handleSave   = () => { setSaved(draft.map((d) => ({ ...d }))); setIsEditing(false); onSave?.(draft); };
  const handleCancel = () => { setDraft(saved.map((s) => ({ ...s }))); setIsEditing(false); };

  const handleSlotChange = (idx) => ({ file, url }) => {
    setDraft((prev) => {
      const next = [...prev];
      next[idx] = { file, url };
      return next;
    });
  };

  const slots = isEditing ? draft : saved;

  return (
    <Card>
      <EditHeader
        title="Promotional Banner"
        isEditing={isEditing}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {slots.map((slot, i) => (
          <UploadSlot
            key={i}
            srcUrl={slot.url}
            isEditing={isEditing}
            onChange={handleSlotChange(i)}
          />
        ))}
      </div>

      {!isEditing && (
        <p className="text-[11px] text-gray-400 mt-3">
          Click the <strong>pencil</strong> icon to upload or replace banner images.
        </p>
      )}
    </Card>
  );
};

export default PromoBannerSection;
