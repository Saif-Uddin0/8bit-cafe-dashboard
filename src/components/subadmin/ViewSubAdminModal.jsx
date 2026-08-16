import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { X, User, Mail, Phone, Shield, CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={13} className="text-gray-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-0.5 break-words">{value ?? "—"}</p>
    </div>
  </div>
);

const ViewSubAdminModal = ({ admin, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!admin) return null;

  const fullName = `${admin.firstName ?? ""} ${admin.lastName ?? ""}`.trim();
  const initials = `${(admin.firstName ?? "")[0] ?? ""}${(admin.lastName ?? "")[0] ?? ""}`.toUpperCase();
  const isActive = admin.status === "ACTIVE";

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col"
        style={{ maxHeight: "calc(100vh - 24px)", animation: "modalIn 0.2s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-none">Admin Details</h2>
              <p className="text-xs text-gray-400 mt-0.5">Read-only view</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Avatar + Name + Status */}
          <div className="flex items-center gap-4">
            {admin.image ? (
              <img
                src={admin.image}
                alt={fullName}
                className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#532C89] flex items-center justify-center shrink-0">
                <span className="text-white text-xl font-bold">{initials || <ImageIcon size={24} />}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 leading-tight truncate">{fullName || "—"}</h3>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
              }`}>
                {isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Details list */}
          <div className="bg-gray-50/70 rounded-xl border border-gray-100 px-3 divide-y divide-gray-100">
            <InfoRow icon={Mail} label="Email" value={admin.email} />
            <InfoRow icon={Phone} label="Phone" value={admin.phone} />
            <InfoRow icon={Shield} label="Role" value={admin.role} />
            <InfoRow icon={CheckCircle2} label="Status" value={isActive ? "Active" : "Inactive"} />
          </div>

          {/* Meta timestamps */}
          {(admin.createdAt || admin.updatedAt) && (
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100 text-xs text-gray-400">
              {admin.createdAt && (
                <div>
                  <p className="font-semibold text-gray-500">Created</p>
                  <p>{new Date(admin.createdAt).toLocaleDateString()}</p>
                </div>
              )}
              {admin.updatedAt && (
                <div>
                  <p className="font-semibold text-gray-500">Updated</p>
                  <p>{new Date(admin.updatedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ViewSubAdminModal;
