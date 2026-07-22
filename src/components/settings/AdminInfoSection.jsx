import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxios";
import { toast } from "react-hot-toast";

// ── Shared primitives (local to this file) ─────────────────────────────────────

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

const Field = ({ label, value, onChange, type = "text", readOnly }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-gray-500">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`w-full px-3 py-2.5 rounded-lg text-sm text-gray-800 border transition-colors
        ${readOnly
          ? "bg-gray-50 border-gray-200 cursor-default outline-none"
          : "bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#532C89]/30 focus:border-[#532C89]"
        }`}
    />
  </div>
);

// ── Main component ──────────────────────────────────────────────────────────────
const AdminInfoSection = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [draft, setDraft] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch the logged-in admin's profile from the backend
  const { data: adminData, isLoading } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/user/getMe");
      return res.data?.data ?? {};
    },
  });

  // Mutation to update the user's profile
  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosSecure.patch("/api/user/profileUpdate", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminProfile"] });
      setIsEditing(false);
      setDraft(null);
    },
    onError: (err) => {
      console.error("Profile update error:", err);
      const msg = err.response?.data?.message || "Failed to update profile";
      toast.error(msg);
    },
  });

  // Build a flat object that matches our field names
  // Falls back to empty strings while loading
  const profileFromAPI = {
    name: adminData ? `${adminData.firstName ?? ""} ${adminData.lastName ?? ""}`.trim() : "",
    phone: adminData?.phone ?? "",
    email: adminData?.email ?? "",
    password: "", // never expose password from API
  };

  const set = (key) => (e) => setDraft((p) => ({ ...p, [key]: e.target.value }));

  const handleEdit = () => {
    setDraft({ ...profileFromAPI });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!draft) return;

    // Split name into firstName and lastName by first whitespace boundary
    const nameParts = (draft.name || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const payload = {
      firstName,
      lastName,
      phone: draft.phone,
      email: draft.email,
    };

    // If password was edited, we can send it (optional for update backend depending on design)
    if (draft.password) {
      payload.password = draft.password;
    }

    updateMutation.mutate(payload);
  };

  const handleCancel = () => {
    setDraft(null);
    setIsEditing(false);
  };

  // While editing use the local draft; otherwise show live API data
  const v = isEditing ? draft : profileFromAPI;

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Admin Name"
          value={v.name}
          onChange={set("name")}
          readOnly={!isEditing}
        />
        <Field
          label="Phone"
          value={v.phone}
          onChange={set("phone")}
          readOnly={!isEditing}
        />
        <Field
          label="Email"
          value={v.email}
          onChange={set("email")}
          type="email"
          readOnly={!isEditing}
        />
        <Field
          label="Password"
          value={v.password}
          onChange={set("password")}
          type={isEditing ? "text" : "password"}
          readOnly={!isEditing}
        />
      </div>
    </Card>
  );
};

export default AdminInfoSection;
