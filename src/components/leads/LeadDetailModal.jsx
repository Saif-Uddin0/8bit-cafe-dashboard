import { useState } from "react";
import {
  X, User, Mail, Phone, Shield, CheckCircle, XCircle, Copy, Check,
} from "lucide-react";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// ─── Copy Field ───────────────────────────────────────────────────────────────
const CopyField = ({ label, value, icon: Icon }) => {
  const [copied, setCopied] = useState(false);
  const canCopy = value && value !== "—";

  const handleCopy = () => {
    if (!canCopy) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 group">
      <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
        <Icon size={13} className="text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
      </div>
      {canCopy && (
        <button
          onClick={handleCopy}
          title={`Copy ${label}`}
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 border cursor-pointer ${
            copied
              ? "bg-green-50 border-green-200 text-green-600"
              : "bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} />}
        </button>
      )}
    </div>
  );
};

// ─── User Details Modal ───────────────────────────────────────────────────────
const LeadDetailModal = ({ lead, onClose }) => {
  if (!lead) return null;

  const fullName   = [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "—";
  const initials   = [lead.firstName?.[0], lead.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "U";
  const isActive   = lead.status === "ACTIVE";
  const isVerified = lead.isverified ?? lead.isVerified ?? false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 mt-0.5">User Details</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer border border-gray-200"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Identity Card ── */}
        <div className="mx-5 mb-4 p-4 rounded-2xl bg-gradient-to-br from-[#532C89] to-[#306BAC] flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-xl font-extrabold shrink-0 overflow-hidden shadow-inner">
            {lead.image
              ? <img src={lead.image} alt={fullName} className="w-full h-full object-cover" />
              : initials
            }
          </div>
          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base leading-snug truncate">{fullName}</p>
            <p className="text-white/60 text-xs font-medium truncate">{lead.email || "No email"}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isActive ? "bg-green-400/25 text-green-200" : "bg-red-400/25 text-red-200"
              }`}>
                {isActive ? <CheckCircle size={9} /> : <XCircle size={9} />}
                {lead.status ?? "—"}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isVerified ? "bg-blue-400/25 text-blue-100" : "bg-white/10 text-white/50"
              }`}>
                <Shield size={9} />
                {isVerified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Copyable Fields ── */}
        <div className="px-5 space-y-2 mb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Contact Info</p>
          <CopyField icon={User}  label="Full Name" value={fullName} />
          <CopyField icon={Mail}  label="Email"     value={lead.email  || "—"} />
          <CopyField icon={Phone} label="Phone"     value={lead.phone  || "—"} />
        </div>

        {/* ── Meta Info ── */}
        <div className="mx-5 mb-5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Role",         value: lead.role || "—" },
              { label: "Verified",     value: isVerified ? "Yes" : "No" },
              { label: "Joined",       value: formatDate(lead.createdAt) },
              { label: "Last Updated", value: formatDate(lead.updatedAt) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LeadDetailModal;
