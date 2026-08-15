import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Pencil, Trash2, X } from "lucide-react";

const ActionCell = ({ onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <td className="py-4 text-right whitespace-nowrap">
      <div ref={ref} className="relative inline-block">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer border-none bg-transparent"
        >
          <MoreVertical size={16} />
        </button>

        {open && (
          <div
            className="absolute right-0 top-9 z-50 flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl shadow-lg px-2.5 py-2"
            style={{ animation: "popIn 0.15s ease-out" }}
          >
            {/* View */}
            {onView && (
              <button
                type="button"
                onClick={() => { setOpen(false); onView(); }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >
                <Eye size={11} />
                View
              </button>
            )}

            {/* Edit */}
            {onEdit && (
              <button
                type="button"
                onClick={() => { setOpen(false); onEdit(); }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-black text-black hover:bg-black hover:text-white text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >
                <Pencil size={11} />
                Edit
              </button>
            )}

            {/* Delete */}
            {onDelete && (
              <button
                type="button"
                onClick={() => { setOpen(false); onDelete(); }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >
                <Trash2 size={11} />
                Delete
              </button>
            )}

            {/* Close */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all cursor-pointer ml-0.5"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9) translateY(-4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </td>
  );
};

export default ActionCell;
