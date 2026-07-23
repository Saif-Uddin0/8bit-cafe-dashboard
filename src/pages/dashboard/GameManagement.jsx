import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Gamepad2, ChevronLeft, ChevronRight,
  MoreVertical, Eye, Pencil, X,
} from "lucide-react";
import GameStatCards from "../../components/game/GameStatCards";
import AddGameModal from "../../components/game/AddGameModal";
import ViewGameModal from "../../components/game/ViewGameModal";
import EditGameModal from "../../components/game/EditGameModal";
import TableScrollWrapper from "../../components/global/TableScrollWrapper";
import useAxiosSecure from "../../hooks/useAxios";
import { toast } from "react-hot-toast";

/* ──────────────────────────────────────────────
   Click-to-open popover action cell
   ⋮ → [View] [Edit] [✕]
────────────────────────────────────────────── */
const ActionCell = ({ onView, onEdit }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
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

        {/* ⋮ trigger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
        >
          <MoreVertical size={16} />
        </button>

        {/* Popover */}
        {open && (
          <div
            className="absolute right-0 top-9 z-50 flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl shadow-lg px-2.5 py-2"
            style={{ animation: "popIn 0.15s ease-out" }}
          >
            {/* View — primary */}
            <button
              onClick={() => { setOpen(false); onView(); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <Eye size={11} />
              View
            </button>

            {/* Edit — secondary */}
            <button
              onClick={() => { setOpen(false); onEdit(); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-black text-black hover:bg-black hover:text-white text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <Pencil size={11} />
              Edit
            </button>

            {/* ✕ close */}
            <button
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

/* ──────────────────────────────────────────────
   Main Page
────────────────────────────────────────────── */
const GameManagement = () => {
  const axiosSecure = useAxiosSecure();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isAddOpen, setIsAddOpen]   = useState(false);
  const [viewGame, setViewGame]     = useState(null); // game object for view modal
  const [editGame, setEditGame]     = useState(null); // game object for edit modal

  // ── Fetch games ──
  const { data: gameResponse, isLoading, isError, refetch } = useQuery({
    queryKey: ["games", currentPage],
    queryFn: async () => {
      const res = await axiosSecure.get(`/api/games?page=${currentPage}&limit=10`);
      return res.data;
    },
  });

  const body  = gameResponse?.data ?? {};
  const meta  = body?.meta ?? {};
  const games = Array.isArray(body?.data) ? body.data : [];

  const totalItems = meta?.total ?? games.length;
  const totalPages = Math.ceil(totalItems / 10) || 1;
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));

  const filteredGames = games.filter((game) =>
    game.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Fetch game categories for modals ──
  const { data: categoryResponse } = useQuery({
    queryKey: ["gameCategories"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/category/getCategories?type=GAME&limit=100");
      const b = res.data;
      if (Array.isArray(b?.data?.data)) return b.data.data;
      if (Array.isArray(b?.data))       return b.data;
      return [];
    },
  });
  const gameCategories = Array.isArray(categoryResponse) ? categoryResponse : [];

  // ── Helper: show exactly one error toast ──
  const showApiError = (err) => {
    const data = err.response?.data;
    // Prefer the first specific field error, fallback to top-level message
    const msg =
      data?.errors?.[0]?.message ||
      data?.message ||
      err.message ||
      "Something went wrong.";
    toast.error(msg);
  };

  // ── Handlers ──
  const handleAddGame = async (formData) => {
    try {
      const res = await axiosSecure.post("/api/games/addGame", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data?.message || "Game added successfully!");
      refetch();
    } catch (err) {
      showApiError(err);
      throw err;
    }
  };

  const handleUpdateGame = async (gameId, formData) => {
    try {
      const res = await axiosSecure.patch(`/api/games/updateGame/${gameId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data?.message || "Game updated successfully!");
      refetch();
    } catch (err) {
      showApiError(err);
      throw err;
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm("Are you sure you want to delete this game?")) return;
    try {
      const res = await axiosSecure.delete(`/api/games/${gameId}`);
      toast.success(res.data?.message || "Game deleted successfully!");
      refetch();
    } catch (err) {
      showApiError(err);
    }
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto px-2 md:px-4 pb-8">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-12 h-12 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-semibold text-sm">Loading games...</p>
        </div>
      ) : isError ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
          <p className="font-semibold">Failed to load games database.</p>
        </div>
      ) : (
        <>
          <GameStatCards games={games} />

          <div className="flex justify-end mt-4">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              <Gamepad2 size={16} />
              <span>Add Game</span>
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm">
            {/* Table header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-gray-900">All Games</h2>
              <div className="relative w-full sm:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search by name or category"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800"
                />
              </div>
            </div>

            <TableScrollWrapper minWidth="700px">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[28%] whitespace-nowrap">Game Name</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[16%] whitespace-nowrap">Category</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[14%] whitespace-nowrap">Price / 30 min</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[14%] whitespace-nowrap">Price / 60 min</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[12%] whitespace-nowrap">Status</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right w-[8%] whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredGames.length > 0 ? (
                    filteredGames.map((game) => {
                      const gameImage = Array.isArray(game.images) && game.images.length > 0
                        ? game.images[0]
                        : null;
                      const isAvailable = game.status === "AVAILABLE" || game.status === "Available";
                      const statusLabel = isAvailable ? "Available" : "Unavailable";

                      return (
                        <tr
                          key={game.id}
                          className="group hover:bg-gray-50/50 transition-colors"
                        >
                          {/* Game Name + Image */}
                          <td className="py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {gameImage ? (
                                <img
                                  src={gameImage}
                                  alt={game.name}
                                  className="w-9 h-9 rounded-xl object-cover border border-gray-100 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                  <Gamepad2 size={18} />
                                </div>
                              )}
                              <span className="truncate max-w-[200px]">{game.name}</span>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                            {game.category?.name || "N/A"}
                          </td>

                          {/* Price 30 min */}
                          <td className="py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            {game.price30Min != null ? `৳${game.price30Min}` : <span className="text-gray-300">—</span>}
                          </td>

                          {/* Price 60 min */}
                          <td className="py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            {game.price60Min != null ? `৳${game.price60Min}` : <span className="text-gray-300">—</span>}
                          </td>

                          {/* Status */}
                          <td className="py-4 whitespace-nowrap">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              isAvailable ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                            }`}>
                              {statusLabel}
                            </span>
                          </td>

                          {/* Popover action buttons */}
                          <ActionCell
                            onView={() => setViewGame(game)}
                            onEdit={() => setEditGame(game)}
                          />
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-10 text-center text-sm text-gray-400">
                        No games found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableScrollWrapper>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-end items-center gap-1.5 mt-5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={activePage === 1}
                  className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                      activePage === idx + 1
                        ? "bg-black text-white"
                        : "text-gray-500 hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={activePage === totalPages}
                  className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* ── Modals ── */}
          {isAddOpen && (
            <AddGameModal
              onClose={() => setIsAddOpen(false)}
              onCreate={handleAddGame}
              categories={gameCategories}
            />
          )}

          {viewGame && (
            <ViewGameModal
              game={viewGame}
              onClose={() => setViewGame(null)}
              onEdit={(g) => setEditGame(g)}
            />
          )}

          {editGame && (
            <EditGameModal
              game={editGame}
              onClose={() => setEditGame(null)}
              onUpdate={handleUpdateGame}
              categories={gameCategories}
            />
          )}
        </>
      )}
    </div>
  );
};

export default GameManagement;