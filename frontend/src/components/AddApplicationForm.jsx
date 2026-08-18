import { useState } from "react";
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
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
      >
        + Add Application
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl space-y-3 mb-4 w-full"
    >
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <input
        type="url"
        placeholder="Job posting link (optional)"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div>
        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
          Follow-up reminder (optional)
        </label>
        <input
          type="date"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
          className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Tags</label>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
        >
          Add
        </button>
        <button
          type="button"
          onClick={reset}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default AddApplicationForm;