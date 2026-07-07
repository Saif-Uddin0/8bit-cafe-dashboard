import React, { useState } from "react";
import { Search, SlidersHorizontal, MoreVertical, Gamepad2 } from "lucide-react";
import GameStatCards from "../../components/game/GameStatCards";
import AddGameModal from "../../components/game/AddGameModal";
import TableScrollWrapper from "../../components/global/TableScrollWrapper";

// Seed games data based on the Figma screenshot
const INITIAL_GAMES = [
  { id: 1, name: "Pool", category: "Games", duration: "30 Minutes", price: "100 tk", status: "Available" },
  { id: 2, name: "Fifa 26", category: "Games", duration: "30 Minutes", price: "100 tk", status: "Available" },
  { id: 3, name: "Fifa 26", category: "Games", duration: "30 Minutes", price: "100 tk", status: "Available" },
  { id: 4, name: "Fifa 26", category: "Games", duration: "30 Minutes", price: "100 tk", status: "Un-available" },
  { id: 5, name: "Fifa 26", category: "Games", duration: "30 Minutes", price: "100 tk", status: "Available" },
];

const GameManagement = () => {
  const [games, setGames] = useState(INITIAL_GAMES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter games based on Name or Category search
  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (game.category && game.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle adding a new game
  const handleAddGame = (newGame) => {
    const nextId = games.length > 0 ? Math.max(...games.map((g) => g.id)) + 1 : 1;
    setGames([...games, { id: nextId, ...newGame }]);
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto px-2 md:px-4 pb-8">
      {/* Page Stats */}
      <GameStatCards games={games} />

      {/* Action Row */}
      <div className="flex justify-end mt-4">
        <button
          id="add-game-btn"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center hover:cursor-pointer gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Gamepad2 size={16} />
          <span>Add Games</span>
        </button>
      </div>

      {/* Games Table Section */}
      <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm">
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-gray-900">All Games</h2>

          {/* Search bar & filter icon wrapper */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <Search size={16} />
              </span>
              <input
                id="game-search"
                type="text"
                placeholder="Search by name or category"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Table with custom horizontal scroll wrapper */}
        <TableScrollWrapper minWidth="640px">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/3">
                  Game Name
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/4">
                  Duration
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/6">
                  Price
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/6">
                  Status
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right w-[10%]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredGames.length > 0 ? (
                filteredGames.map((game) => (
                  <tr key={game.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Game Name */}
                    <td className="py-4 text-sm font-semibold text-gray-900">
                      {game.name}
                    </td>
                    {/* Duration */}
                    <td className="py-4 text-sm text-gray-600">
                      {game.duration}
                    </td>
                    {/* Price */}
                    <td className="py-4 text-sm text-gray-600">
                      {game.price}
                    </td>
                    {/* Status badge */}
                    <td className="py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          game.status === "Available"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {game.status}
                      </span>
                    </td>
                    {/* Three-dot action */}
                    <td className="py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-sm text-gray-400">
                    No games found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableScrollWrapper>
      </div>

      {/* Modal dialog */}
      {isModalOpen && (
        <AddGameModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleAddGame}
        />
      )}
    </div>
  );
};

export default GameManagement;