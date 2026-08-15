import React, { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Check, ImageIcon, Upload, Trash2, Loader2, Globe } from "lucide-react";
import useAxiosSecure from "../../hooks/useAxios";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

// ─── Presentational helpers ───────────────────────────────────────────────────

const Card = ({ children }) => (
  <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
    {children}
  </div>
);

const EditHeader = ({ title, isEditing, onEdit, onCancel }) => (
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-base font-bold text-gray-900">{title}</h2>
    <div className="flex items-center gap-2">
      {isEditing ? (
        <button
          onClick={onCancel}
          title="Done Editing"
          className="px-4 py-1.5 flex items-center gap-1.5 rounded-xl bg-black text-white hover:bg-gray-800 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Check size={13} />
          Done
        </button>
      ) : (
        <button
          onClick={onEdit}
          title="Edit Banners"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <Pencil size={15} />
        </button>
      )}
    </div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const PromoBannerSection = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [loadingBanners, setLoadingBanners] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const uploadInputRef = useRef(null);

  // ── React Query — separate query keys ────────────────────────────────────
  const {
    data: draftBanners = [],
    isLoading: isLoadingDraft,
    isError: isErrorDraft,
    refetch: refetchDraft,
  } = useQuery({
    queryKey: ["banners", "draft"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/banners/false");
      return res.data?.data || [];
    },
    retry: false,
  });

  const {
    data: publishedBanners = [],
    isLoading: isLoadingPublished,
    isError: isErrorPublished,
    refetch: refetchPublished,
  } = useQuery({
    queryKey: ["banners", "published"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/banners/true");
      return res.data?.data || [];
    },
    retry: false,
  });

  // After every successful mutation we invalidate both draft and published caches
  const refreshBanners = () => {
    queryClient.invalidateQueries({ queryKey: ["banners", "draft"] });
    queryClient.invalidateQueries({ queryKey: ["banners", "published"] });
  };

  // ── Upload: POST /api/banners ─────────────────────────────────────────────
  const handleUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axiosSecure.post("/api/banners", formData);
      await refreshBanners();
      toast.success("Banner uploaded successfully!");
    } catch (err) {
      console.error("Banner upload error:", err);
      toast.error(err.response?.data?.message || "Failed to upload banner.");
    } finally {
      setIsUploading(false);
    }
  };

  // ── Publish: PATCH /api/banners/:id?isPublish=true ────────────────────────
  const handlePublish = async (bannerId, e) => {
    e.stopPropagation();
    setLoadingBanners((prev) => ({ ...prev, [bannerId]: true }));

    try {
      await axiosSecure.patch(`/api/banners/${bannerId}?isPublish=true`);
      await refreshBanners();
      toast.success("Banner published successfully!");
    } catch (err) {
      console.error("Banner publish error:", err);
      toast.error(err.response?.data?.message || "Failed to publish banner.");
    } finally {
      setLoadingBanners((prev) => ({ ...prev, [bannerId]: false }));
    }
  };

  // ── Delete: DELETE /api/banners/:id ──────────────────────────────────────
  const handleDelete = (bannerId, e) => {
    e.stopPropagation();

    Swal.fire({
      title: "Are you sure you want to delete this banner?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      setLoadingBanners((prev) => ({ ...prev, [bannerId]: true }));
      try {
        await axiosSecure.delete(`/api/banners/${bannerId}`);
        await refreshBanners();
        Swal.fire("Deleted!", "Banner has been deleted.", "success");
      } catch (err) {
        console.error("Banner deletion error:", err);
        Swal.fire(
          "Error",
          err.response?.data?.message || err.message || "Failed to delete banner.",
          "error"
        );
      } finally {
        setLoadingBanners((prev) => ({ ...prev, [bannerId]: false }));
      }
    });
  };

  // ── Drag-and-drop on Upload Card ──────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    handleUpload(file);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Card>
      <EditHeader
        title="Promotional Banner"
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancel={() => setIsEditing(false)}
      />

      {isLoadingDraft || isLoadingPublished ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="w-9 h-9 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-semibold text-xs">Loading banners...</p>
        </div>
      ) : isErrorDraft || isErrorPublished ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col gap-2">
          <p className="text-red-700 text-sm font-medium">
            Failed to load promotional banners. The server may be temporarily busy.
          </p>
          <button
            onClick={() => {
              refetchDraft();
              refetchPublished();
            }}
            className="self-start px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ─── Published Banners Section ────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              Published Banners
              <span className="text-xs font-normal text-gray-400">({publishedBanners.length})</span>
            </h3>

            {publishedBanners.length === 0 ? (
              <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 text-center">
                <p className="text-gray-400 text-xs font-medium">No published banners available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {publishedBanners.map((banner) => {
                  const bannerId = banner?.id || banner?._id;
                  const isLoadingSlot = loadingBanners[bannerId];

                  return (
                    <div
                      key={bannerId}
                      className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex flex-col items-center justify-center group"
                    >
                      {/* Published Status Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow-sm">
                          Published
                        </span>
                      </div>

                      {isLoadingSlot ? (
                        <div className="flex flex-col items-center gap-1.5 text-gray-500 font-medium">
                          <Loader2 size={24} className="animate-spin text-black" />
                          <span className="text-[10px]">Processing...</span>
                        </div>
                      ) : (
                        <>
                          <img
                            src={banner.image}
                            alt="Published Banner"
                            className="w-full h-full object-cover"
                            decoding="async"
                          />

                          {/* Hover action overlay only when editing */}
                          {isEditing && (
                            <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <div className="flex items-center gap-3">
                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={(e) => handleDelete(bannerId, e)}
                                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer"
                                  title="Delete Banner"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* ─── Draft Banners Section ────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              Draft Banners
              <span className="text-xs font-normal text-gray-400">({draftBanners.length})</span>
            </h3>

            {draftBanners.length === 0 && !isEditing ? (
              <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 text-center">
                <p className="text-gray-400 text-xs font-medium">No draft banners available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {draftBanners.map((banner) => {
                  const bannerId = banner?.id || banner?._id;
                  const isLoadingSlot = loadingBanners[bannerId];

                  return (
                    <div
                      key={bannerId}
                      className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex flex-col items-center justify-center group"
                    >
                      {/* Draft Status Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 shadow-sm">
                          Draft
                        </span>
                      </div>

                      {isLoadingSlot ? (
                        <div className="flex flex-col items-center gap-1.5 text-gray-500 font-medium">
                          <Loader2 size={24} className="animate-spin text-black" />
                          <span className="text-[10px]">Processing...</span>
                        </div>
                      ) : (
                        <>
                          <img
                            src={banner.image}
                            alt="Draft Banner"
                            className="w-full h-full object-cover"
                            decoding="async"
                          />

                          {/* Hover action overlay only when editing */}
                          {isEditing && (
                            <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <div className="flex items-center gap-3">
                                {/* Publish */}
                                <button
                                  type="button"
                                  onClick={(e) => handlePublish(bannerId, e)}
                                  className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer"
                                  title="Publish Banner"
                                >
                                  <Globe size={15} />
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={(e) => handleDelete(bannerId, e)}
                                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer"
                                  title="Delete Banner"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}

                {/* Upload Card */}
                {isEditing && (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => uploadInputRef.current?.click()}
                    className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 hover:border-black hover:bg-gray-100/50 cursor-pointer flex flex-col items-center justify-center gap-1.5 select-none text-center p-4 transition-all duration-200"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-1.5 text-gray-500 font-medium">
                        <Loader2 size={24} className="animate-spin text-black" />
                        <span className="text-[10px]">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={20} className="text-gray-400" />
                        <div>
                          <p className="text-xs font-semibold text-gray-500">
                            Click or drag to upload
                          </p>
                          <p className="text-[9px] text-gray-400 mt-0.5">(JPG, PNG, WEBP)</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input for uploads */}
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleUpload(file);
          }
          e.target.value = ""; // reset so the same file can be re-picked
        }}
        className="hidden"
      />

      {!isEditing && (
        <p className="text-[11px] text-gray-400 mt-3.5">
          Click the <strong>pencil</strong> icon to toggle editing mode and manage banners.
        </p>
      )}
    </Card>
  );
};

export default PromoBannerSection;
