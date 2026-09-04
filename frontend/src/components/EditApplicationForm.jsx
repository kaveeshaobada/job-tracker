import { useState } from "react";
import { X } from "lucide-react";
import TagInput from "./ui/TagInput";
import api from "../api/client";
import toast from "react-hot-toast";

function EditApplicationForm({ app, onClose, onUpdated }) {
    const [company, setCompany] = useState(app.company);
    const [role, setRole] = useState(app.role);
    const [link, setLink] = useState(app.link || "");
    const [followUpDate, setFollowUpDate] = useState(
        app.followUpDate ? app.followUpDate.slice(0, 10) : ""
    );
    const [tags, setTags] = useState(app.tags?.map((t) => t.name) || []);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            const res = await api.put(`/applications/${app.id}`, {
                company,
                role,
                status: app.status,
                link: link || undefined,
                followUpDate: followUpDate || undefined,
                tagNames: tags,
            });
            onUpdated(res.data);
            onClose();
            toast.success("Application updated");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update application");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface dark:bg-surface-dark border border-border-subtle dark:border-border-subtle-dark p-5 rounded-xl space-y-3 w-full max-w-md relative"
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted dark:text-muted-dark"
                >
                    <X size={18} />
                </button>
                <h2 className="font-semibold text-lg mb-1">Edit Application</h2>
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="grid sm:grid-cols-2 gap-3">
                    <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Company"
                        className="w-full p-2.5 rounded-lg bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                    />
                    <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Role"
                        className="w-full p-2.5 rounded-lg bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                    />
                </div>

                <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="Job posting link (optional)"
                    className="w-full p-2.5 rounded-lg bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
                />

                <div>
                    <label className="text-xs text-muted dark:text-muted-dark block mb-1">
                        Follow-up reminder
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
                        disabled={saving}
                        className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-elevated dark:bg-elevated-dark hover:opacity-80 px-4 py-2 rounded-lg font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditApplicationForm;