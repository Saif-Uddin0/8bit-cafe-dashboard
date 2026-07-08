import React, { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

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
          <button
            onClick={onSave}
            title="Save"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#532C89] text-white hover:bg-[#6C04D7] transition-colors"
          >
            <Check size={15} />
          </button>
          <button
            onClick={onCancel}
            title="Cancel"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X size={15} />
          </button>
        </>
      ) : (
        <button
          onClick={onEdit}
          title="Edit"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Pencil size={15} />
        </button>
      )}
    </div>
  </div>
);

const Field = ({ label, value, onChange, type = "text", readOnly }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-gray-500">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`w-full px-3 py-2.5 rounded-lg text-sm text-gray-800 border transition-colors
        ${readOnly
          ? "bg-gray-50 border-gray-200 cursor-default outline-none"
          : "bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#532C89]/30 focus:border-[#532C89]"
        }`}
    />
  </div>
);

// ── Default data ────────────────────────────────────────────────────────────────
const DEFAULTS = {
  name: "KLYP Barbershop",
  phone: "+1 (555) 123-4967",
  email: "jordan@klyp.com",
  password: "MySecurePass123",
};

// ── Main component ──────────────────────────────────────────────────────────────
const AdminInfoSection = ({ onSave }) => {
  const [saved, setSaved] = useState(DEFAULTS);
  const [draft, setDraft] = useState(DEFAULTS);
  const [isEditing, setIsEditing] = useState(false);

  const set = (key) => (e) => setDraft((p) => ({ ...p, [key]: e.target.value }));

  const handleEdit   = () => { setDraft(saved); setIsEditing(true); };
  const handleSave   = () => { setSaved(draft); setIsEditing(false); onSave?.(draft); };
  const handleCancel = () => { setDraft(saved); setIsEditing(false); };

  const v = isEditing ? draft : saved;

  return (
    <Card>
      <EditHeader
        title="Admin Information"
        isEditing={isEditing}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Admin Name"  value={v.name}     onChange={set("name")}     readOnly={!isEditing} />
        <Field label="Phone"       value={v.phone}    onChange={set("phone")}    readOnly={!isEditing} />
        <Field label="Email"       value={v.email}    onChange={set("email")}    type="email"          readOnly={!isEditing} />
        <Field label="Password"    value={v.password} onChange={set("password")} type={isEditing ? "text" : "password"} readOnly={!isEditing} />
      </div>
    </Card>
  );
};

export default AdminInfoSection;
