import { useState, useRef } from "react";
import { Pencil, Check, X, Camera, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxios";
import { toast } from "react-hot-toast";

// ── Shared primitives ───────────────────────────────────────────────────────────

const Card = ({ children }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    {children}
  </div>
);

const EditHeader = ({ title, isEditing, isLoading, onEdit, onSave, onCancel }) => (
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-base font-bold text-gray-900">{title}</h2>
    <div className="flex items-center gap-2">
      {isEditing ? (
        <>
          <button
            onClick={onSave}
            disabled={isLoading}
            title="Save"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#532C89] text-white hover:bg-[#6C04D7] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check size={15} />
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            title="Cancel"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X size={15} />
          </button>
        </>
      ) : (
        <button
          onClick={onEdit}
          title="Edit"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <Pencil size={15} />
        </button>
      )}
    </div>
  </div>
);

const Field = ({ label, value = "", onChange, type = "text", readOnly }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-gray-500">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`w-full px-3 py-2.5 rounded-lg text-sm text-gray-800 border transition-colors
        ${
          readOnly
            ? "bg-gray-50 border-gray-200 cursor-default outline-none"
            : "bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#532C89]/30 focus:border-[#532C89]"
        }`}
    />
  </div>
);

// ── Avatar uploader (self-contained component with its own ref) ─────────────────

const AvatarUploader = ({ currentImageUrl, isEditing, onFileSelect, previewUrl }) => {
  // useRef is valid here — AvatarUploader is a proper React component
  const fileInputRef = useRef(null);

  // Show the newly selected local preview first; fall back to the server image
  const displaySrc = previewUrl || currentImageUrl || null;

  return (
    <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
      {/* Avatar circle */}
      <div className="relative flex-shrink-0">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
          {displaySrc ? (
            <img
              src={displaySrc}
              alt="Admin avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={28} className="text-gray-400" />
          )}
        </div>

        {/* Camera button — only visible in edit mode */}
        {isEditing && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Change avatar"
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#532C89] text-white flex items-center justify-center shadow-md hover:bg-[#6C04D7] transition-colors cursor-pointer"
          >
            <Camera size={12} />
          </button>
        )}

        {/* Hidden file input — triggered by the camera button above */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
            // Reset the input value so the same file can be re-selected
            e.target.value = "";
          }}
        />
      </div>

      {/* Description text */}
      <div>
        <p className="text-sm font-semibold text-gray-800">Profile Photo</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {isEditing
            ? "Click the camera icon to upload a new photo"
            : "Admin profile image"}
        </p>
      </div>
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────────

const AdminInfoSection = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  // draft holds the in-progress edits; null when not editing
  const [draft, setDraft] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Raw File object chosen by the user for image upload
  const [imageFile, setImageFile] = useState(null);
  // Local object URL for instant preview before the upload completes
  const [previewUrl, setPreviewUrl] = useState(null);

  // ── GET /api/user/getMe ───────────────────────────────────────────────────────
  const { data: adminData, isLoading } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/user/getMe");
      // API shape: { success: true, data: { firstName, lastName, email, role, phone, image, ... } }
      return res.data?.data ?? {};
    },
  });

  // ── PATCH /api/user/profileUpdate (multipart/form-data) ───────────────────────
  const updateMutation = useMutation({
    mutationFn: async (formData) => {
      // axiosSecure automatically attaches the Bearer token.
      const res = await axiosSecure.patch("/api/user/updateUser", formData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      // Invalidate so the GET re-runs and the UI reflects server state
      queryClient.invalidateQueries({ queryKey: ["adminProfile"] });
      setIsEditing(false);
      setDraft(null);
      setImageFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    },
    onError: (err) => {
      console.error("Profile update error:", err);
      const msg = err.response?.data?.message || "Failed to update profile";
      toast.error(msg);
    },
  });

  // ── Build the "display" snapshot from the API response ────────────────────────
  // All values default to "" so controlled inputs never receive undefined
  const profileFromAPI = {
    firstName: adminData?.firstName ?? "",
    lastName: adminData?.lastName ?? "",
    // Combined for the single-input display
    name: adminData
      ? `${adminData.firstName ?? ""} ${adminData.lastName ?? ""}`.trim()
      : "",
    phone: adminData?.phone ?? "",
    email: adminData?.email ?? "",
    role: adminData?.role ?? "",
  };

  // Convenience setter — curried so each Field's onChange is one line
  const set = (key) => (e) =>
    setDraft((prev) => ({ ...prev, [key]: e.target.value }));

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleEdit = () => {
    // Seed the draft from the latest API data
    setDraft({ ...profileFromAPI });
    setIsEditing(true);
  };

  const handleFileSelect = (file) => {
    setImageFile(file);
    // Revoke the old preview URL first to avoid memory leaks
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = () => {
    if (!draft) return;

    // Split "Admin Name" into firstName / lastName on the first whitespace
    const nameParts = (draft.name || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const formData = new FormData();

    // Only append fields that have actually changed from their original values to prevent
    // validation errors on unmodified existing invalid fields (such as phone numbers).
    if (draft.name !== profileFromAPI.name) {
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
    }

    if (draft.email !== profileFromAPI.email) {
      formData.append("email", draft.email || "");
    }

    if (draft.phone !== profileFromAPI.phone) {
      formData.append("phone", draft.phone || "");
    }

    // Only attach the image when the user actually picked a new file
    if (imageFile) {
      formData.append("image", imageFile);
    }

    // Check if there are any changes to submit
    let hasChanges = false;
    for (const key of formData.keys()) {
      hasChanges = true;
      break;
    }

    if (!hasChanges) {
      toast.error("No changes detected to update.");
      setIsEditing(false);
      return;
    }

    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setDraft(null);
    setIsEditing(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setImageFile(null);
  };

  // While editing, use the local draft; otherwise show the server snapshot.
  // Guard: if draft is somehow null while isEditing, fall back to profileFromAPI
  const v = (isEditing && draft) ? draft : profileFromAPI;

  // ── Loading state ─────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center gap-3 py-4">
          <div className="w-5 h-5 border-2 border-[#532C89] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading admin info...</span>
        </div>
      </Card>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <Card>
      <EditHeader
        title="Admin Information"
        isEditing={isEditing}
        isLoading={updateMutation.isPending}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {/* Profile photo row */}
      <AvatarUploader
        currentImageUrl={adminData?.image}
        isEditing={isEditing}
        onFileSelect={handleFileSelect}
        previewUrl={previewUrl}
      />

      {/* Text fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full name — split into firstName + lastName on save */}
        <Field
          label="Admin Name"
          value={v.name ?? ""}
          onChange={set("name")}
          readOnly={!isEditing}
        />

        <Field
          label="Phone"
          value={v.phone ?? ""}
          onChange={set("phone")}
          readOnly={!isEditing}
        />

        <Field
          label="Email"
          value={v.email ?? ""}
          onChange={set("email")}
          type="email"
          readOnly={!isEditing}
        />

        {/* Role is read-only — admins cannot change their own role */}
        <Field
          label="Role"
          value={v.role ?? ""}
          readOnly={true}
        />


      </div>
    </Card>
  );
};

export default AdminInfoSection;
