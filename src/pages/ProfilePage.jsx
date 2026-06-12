import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Lock, X } from "lucide-react";

// small inline modal component
const ChangePasswordModal = ({ open, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });

  useEffect(() => {
    if (!open) setForm({ current: "", next: "", confirm: "" });
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Lock className="w-5 h-5" /> Change Password
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X />
          </button>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (form.next !== form.confirm) return alert("Passwords do not match");
            await onSubmit(form.current, form.next);
            onClose();
          }}
          className="space-y-3"
        >
          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="Current password"
            value={form.current}
            onChange={(e) => setForm({ ...form, current: e.target.value })}
            required
          />
          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="New password"
            value={form.next}
            onChange={(e) => setForm({ ...form, next: e.target.value })}
            required
          />
          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="Confirm new password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            required
          />

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" className="btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Fullscreen image viewer component
const FullscreenImageViewer = ({ src, open, onClose }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !src) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-4 right-4 btn btn-ghost btn-circle" onClick={onClose} aria-label="Close">
        <X />
      </button>
      <img
        src={src}
        alt="Full"
        className="max-w-full max-h-full object-contain cursor-zoom-out"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const { changePassword, isChangingPassword } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState("");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 cursor-zoom-in"
                onClick={() => {
                  const src = selectedImg || authUser.profilePic || "/avatar.png";
                  setViewerSrc(src);
                  setIsViewerOpen(true);
                }}
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Change Password</span>
                <button className="btn btn-sm btn-outline" onClick={() => setIsModalOpen(true)}>
                  Change
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChangePasswordModal
        open={isModalOpen}
        loading={isChangingPassword}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (current, next) => {
          await changePassword(current, next);
        }}
      />
      <FullscreenImageViewer src={viewerSrc} open={isViewerOpen} onClose={() => setIsViewerOpen(false)} />
    </div>
  );
};
export default ProfilePage;
