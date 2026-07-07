import React from "react";

const AllGamesTable = () => {
  const games = [
    { name: "Pool", duration: "30 Minutes", price: "100 tk", status: "Available" },
    { name: "Fifa 26", duration: "30 Minutes", price: "100 tk", status: "Available" },
    { name: "Fifa 26", duration: "30 Minutes", price: "100 tk", status: "Available" },
    { name: "Fifa 26", duration: "30 Minutes", price: "100 tk", status: "Un-available" },
    { name: "Fifa 26", duration: "30 Minutes", price: "100 tk", status: "Available" },
  ];

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">All Games</h2>
      </div>

      {/* Responsive table wrapper for dragging/scrolling on mobile devices */}
      <div className="overflow-x-auto w-full custom-scrollbar">
        <table className="w-full min-w-[500px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Game Name
              </th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {games.map((game, index) => (
              <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 text-sm font-semibold text-gray-800">
                  {game.name}
                </td>
                <td className="py-4 text-sm text-gray-600">
                  {game.duration}
                </td>
                <td className="py-4 text-sm text-gray-600">
                  {game.price}
                </td>
                <td className="py-4 text-sm">
                  {game.status === "Available" ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E6FDF5] text-[#10B981] border border-[#A7F3D0]/30">
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5]/30">
                      Un-available
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllGamesTable;
