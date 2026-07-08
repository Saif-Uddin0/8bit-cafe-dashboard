import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, User } from "lucide-react";
import TableScrollWrapper from "../global/TableScrollWrapper";

const SubAdminTable = ({ admins = [] }) => {
  const [activeRow, setActiveRow] = useState(null);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveRow(null);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const statusClass = (status) =>
    status === "Active"
      ? "bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold"
      : "bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold";

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
      <h2 className="text-base font-bold text-gray-800 mb-4">All Admin</h2>

      <TableScrollWrapper minWidth="600px">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100">
              {["Admin Image", "Admin Name", "Role", "Email", "Status", "Action"].map((h) => (
                <th key={h} className="pb-3 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {admins.length > 0 ? admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">

                {/* Avatar */}
                <td className="py-4 pr-6 whitespace-nowrap">
                  {admin.image ? (
                    <img src={admin.image} alt={admin.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                      <User size={18} />
                    </div>
                  )}
                </td>

                <td className="py-4 pr-6 text-sm font-semibold text-gray-800 whitespace-nowrap">{admin.name}</td>
                <td className="py-4 pr-6 text-sm text-gray-500 whitespace-nowrap">{admin.role}</td>
                <td className="py-4 pr-6 text-sm text-gray-500 whitespace-nowrap">{admin.email}</td>

                {/* Status badge */}
                <td className="py-4 pr-6 whitespace-nowrap">
                  <span className={statusClass(admin.status)}>{admin.status}</span>
                </td>

                {/* Action — left-aligned, no extra right padding */}
                <td className="py-4 whitespace-nowrap relative">
                  <button
                    onClick={() => setActiveRow(activeRow === admin.id ? null : admin.id)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {activeRow === admin.id && (
                    <div ref={menuRef} className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                      <button onClick={() => setActiveRow(null)} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">View Details</button>
                      <button onClick={() => setActiveRow(null)} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">Edit Admin</button>
                      <button onClick={() => setActiveRow(null)} className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="py-10 text-center text-sm text-gray-400">No admins found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </TableScrollWrapper>
    </div>
  );
};

export default SubAdminTable;
