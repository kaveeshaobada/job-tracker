import { useState } from "react";

function AddApplicationForm({ onAdd }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [link, setLink] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!company || !role) return;
    onAdd({ company, role, link, status: "Applied" });
    setCompany("");
    setRole("");
    setLink("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium"
      >
        + Add Application
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-4 rounded-lg space-y-3 mb-4"
    >
      <input
        type="text"
        placeholder="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <input
        type="text"
        placeholder="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <input
        type="url"
        placeholder="Job posting link (optional)"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default AddApplicationForm;