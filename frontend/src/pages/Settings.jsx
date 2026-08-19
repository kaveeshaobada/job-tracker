import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import api from "../api/client";
import AppShell from "../components/AppShell";
import toast from "react-hot-toast";

function Settings() {
  const [profile, setProfile] = useState({ name: "", targetRole: "", weeklyGoal: 5 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    </AppShell>
  );
}

export default Settings;