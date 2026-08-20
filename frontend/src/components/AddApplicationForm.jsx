import { useState } from "react";
import { Plus } from "lucide-react";
import TagInput from "./ui/TagInput";

function AddApplicationForm({ onAdd }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [link, setLink] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [tags, setTags] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setCompany("");
    setRole("");
    setLink("");
    setFollowUpDate("");
    setTags([]);
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!company || !role) return;
    try {
      await onAdd({
        company,
        role,
        link: link || undefined,
        followUpDate: followUpDate || undefined,
        tagNames: tags,
        status: "Applied",
      });
      reset();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add application");
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium"
      >
        <Plus size={16} /> Add Application
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={reset}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface dark:bg-surface-dark border border-border-subtle dark:border-border-subtle-dark p-5 rounded-xl space-y-3 w-full max-w-md"
      >
        <h2 className="font-semibold text-lg mb-1">Add Application</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
          <input
            type="text"
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
        </div>

        <input
          type="url"
          placeholder="Job posting link (optional)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full p-2.5 rounded-lg bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <div>
          <label className="text-xs text-muted dark:text-muted-dark block mb-1">
            Follow-up reminder (optional)
          </label>
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="text-xs text-muted dark:text-muted-dark block mb-1">Tags</label>
          <TagInput tags={tags} onChange={setTags} />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium"
          >
            Add
          </button>
          <button
            type="button"
            onClick={reset}
            className="bg-elevated dark:bg-elevated-dark hover:opacity-80 px-4 py-2 rounded-lg font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddApplicationForm;