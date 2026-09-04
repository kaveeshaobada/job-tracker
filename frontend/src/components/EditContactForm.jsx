import { useState } from "react";
import { X } from "lucide-react";
import api from "../api/client";
import toast from "react-hot-toast";

function EditContactForm({ contact, applications, onClose, onUpdated }) {
    const [form, setForm] = useState({
        name: contact.name,
        role: contact.role || "",
        company: contact.company || "",
        email: contact.email || "",
        notes: contact.notes || "",
        applicationId: contact.applicationId || "",
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put(`/contacts/${contact.id}`, {
                ...form,
                applicationId: form.applicationId || null,
            });
            onUpdated(res.data);
            onClose();
            toast.success("Contact updated");
        } catch {
            toast.error("Failed to update contact");
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
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-muted dark:text-muted-dark">
                    <X size={18} />
                </button>
                <h2 className="font-semibold text-lg mb-1">Edit Contact</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <input
                        type="text"
                        placeholder="Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="p-2.5 rounded-lg bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Role"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="p-2.5 rounded-lg bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <input
                        type="text"
                        placeholder="Company"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="p-2.5 rounded-lg bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="p-2.5 rounded-lg bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
                <select
                    value={form.applicationId}
                    onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
                >
                    <option value="">Not linked to an application</option>
                    {applications.map((a) => (
                        <option key={a.id} value={a.id}>
                            {a.company} — {a.role}
                        </option>
                    ))}
                </select>
                <textarea
                    placeholder="Notes"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full p-2.5 rounded-lg bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
}

export default EditContactForm;