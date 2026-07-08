import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, User } from "lucide-react";
import TableScrollWrapper from "../global/TableScrollWrapper";

const SubAdminTable = ({ admins = [] }) => {
  const [activeActionRow, setActiveActionRow] = useState(null);
  const actionMenuRef = useRef(null);

  // Close action dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setActiveActionRow(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Status badge styling helper
  const getStatusBadge = (status) => {
    if (status === "Active") {
      return "bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold";
    }
    return "bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold";
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
      {/* Section Title */}
      <h2 className="text-base font-bold text-gray-800 mb-4">All Admin</h2>

      {/* Responsive table wrapper */}
      <TableScrollWrapper minWidth="640px">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                Admin Image
              </th>
              <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                Admin Name
              </th>
              <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                Role
              </th>
              <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                Email
              </th>
              <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {admins.length > 0 ? (
              admins.map((admin) => (
                <tr
                  key={admin.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {/* Admin Avatar */}
                  <td className="py-4 pr-4 whitespace-nowrap">
                    {admin.image ? (
                      <img
                        src={admin.image}
                        alt={admin.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      // Fallback placeholder avatar if no image
                      <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                        <User size={20} />
                      </div>
                    )}
                  </td>

                  {/* Admin Name */}
                  <td className="py-4 pr-4 text-sm font-semibold text-gray-800 whitespace-nowrap">
                    {admin.name}
                  </td>

                  {/* Role */}
                  <td className="py-4 pr-4 text-sm text-gray-500 whitespace-nowrap">
                    {admin.role}
                  </td>

                  {/* Email */}
                  <td className="py-4 pr-4 text-sm text-gray-500 whitespace-nowrap">
                    {admin.email}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 pr-4 whitespace-nowrap">
                    <span className={getStatusBadge(admin.status)}>
                      {admin.status}
                    </span>
                  </td>

                  {/* Row Action Menu */}
                  <td className="py-4 text-right whitespace-nowrap relative">
                    <button
                      onClick={() =>
                        setActiveActionRow(
                          activeActionRow === admin.id ? null : admin.id
                        )
                      }
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {/* Dropdown action menu */}
                    {activeActionRow === admin.id && (
                      <div
                        ref={actionMenuRef}
                        className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            alert(`Viewing ${admin.name}`);
                            setActiveActionRow(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            alert(`Editing ${admin.name}`);
                            setActiveActionRow(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Edit Admin
                        </button>
                        <button
                          onClick={() => {
                            alert(`Deleting ${admin.name}`);
                            setActiveActionRow(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="py-10 text-center text-sm text-gray-400"
                >
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableScrollWrapper>
    </div>
  );
};

export default SubAdminTable;
