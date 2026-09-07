import { useEffect, useState } from "react";
import { Save, Bell } from "lucide-react";
import api from "../api/client";
import AppShell from "../components/AppShell";
import toast from "react-hot-toast";
import { useRef } from "react";
import { Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import heic2any from "heic2any";
import AvatarCropModal from "../components/AvatarCropModal";


function Settings() {
  const [profile, setProfile] = useState({ name: "", targetRole: "", weeklyGoal: 5, remindersEnabled: true, avatarUrl: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { updateUser } = useAuth();
  const [cropSrc, setCropSrc] = useState(null);
  const [viewingAvatar, setViewingAvatar] = useState(false);

  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleFileSelect = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    const isHeic =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif");

    if (isHeic) {
      try {
        const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
        file = new File([converted], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
          type: "image/jpeg",
        });
      } catch {
        toast.error("Couldn't process that HEIC image");
        e.target.value = "";
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropped = async (blob) => {
    setCropSrc(null);
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", blob, "avatar.jpg");
    try {
      const res = await api.post("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(res.data);
      updateUser({ avatarUrl: res.data.avatarUrl, name: res.data.name });
      toast.success("Profile picture updated");
    } catch {
      toast.error("Failed to upload picture");
    } finally {
      setUploadingAvatar(false);
    }
  };

  function isHeicConversionError(err) {
    return err?.message?.includes("format") || !err?.response;
  }

  useEffect(() => {
    let ignore = false;
    api.get("/users/me").then((res) => {
      if (!ignore) setProfile(res.data);
      if (!ignore) setLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/users/me", profile);
      updateUser({ name: profile.name });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <p className="text-muted dark:text-muted-dark">Loading...</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-sm text-muted dark:text-muted-dark mb-6">
          Personalize your job search profile
        </p>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <button
              onClick={() => profile.avatarUrl && setViewingAvatar(true)}
              className={profile.avatarUrl ? "cursor-pointer" : "cursor-default"}
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border border-border-subtle dark:border-border-subtle-dark"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-elevated dark:bg-elevated-dark flex items-center justify-center text-xl font-semibold text-muted dark:text-muted-dark border border-border-subtle dark:border-border-subtle-dark">
                  {profile.name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 bg-accent hover:bg-accent-hover text-white p-1.5 rounded-full disabled:opacity-50"
            >
              <Camera size={12} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-sm font-medium">Profile Picture</p>
            <p className="text-xs text-muted dark:text-muted-dark">
              {uploadingAvatar ? "Uploading..." : "JPG, PNG, WEBP or HEIC, max 10MB"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Name</label>
            <input
              type="text"
              value={profile.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Your name"
              className="w-full p-2.5 rounded-lg bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Target Role</label>
            <input
              type="text"
              value={profile.targetRole || ""}
              onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
              placeholder="e.g. Software Engineer Intern"
              className="w-full p-2.5 rounded-lg bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">
              Weekly Application Goal
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={profile.weeklyGoal}
              onChange={(e) => setProfile({ ...profile, weeklyGoal: e.target.value })}
              className="w-full p-2.5 rounded-lg bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-xs text-muted dark:text-muted-dark mt-1">
              Used to track your weekly progress on the dashboard
            </p>
          </div>

          <div className="pt-3 border-t border-border-subtle dark:border-border-subtle-dark">
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Bell size={16} className="text-accent" /> Notification Preferences
            </h2>
            <div className="flex items-center justify-between p-3 rounded-lg bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark">
              <div>
                <p className="text-sm font-medium">Date Reminder Notifications</p>
                <p className="text-xs text-muted dark:text-muted-dark">
                  Receive automatic reminders 7 days and 1 day before application follow-up dates
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                <input
                  type="checkbox"
                  checked={profile.remindersEnabled ?? true}
                  onChange={(e) => setProfile({ ...profile, remindersEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface dark:bg-surface-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent border border-border-subtle dark:border-border-subtle-dark"></div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-lg font-medium disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          onClose={() => setCropSrc(null)}
          onCropped={handleCropped}
        />
      )}
      {viewingAvatar && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingAvatar(false)}
        >
          <img src={profile.avatarUrl} alt="Profile" className="max-w-sm max-h-[80vh] rounded-lg object-contain" />
        </div>
      )}
    </AppShell>
  );
}

export default Settings;