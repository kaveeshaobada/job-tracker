import { useEffect, useState } from "react";
import { Plus, Trash2, Mail, Building2, X } from "lucide-react";
import api from "../api/client";
import AppShell from "../components/AppShell";
import toast from "react-hot-toast";

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", company: "", email: "", notes: "" });

  useEffect(() => {
    let ignore = false;
    api
      .get("/contacts")
      .then((res) => {
        if (!ignore) setContacts(res.data);
      })
      .catch(() => toast.error("Failed to load contacts"))
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      const res = await api.post("/contacts", form);
      setContacts((prev) => [res.data, ...prev]);
      setForm({ name: "", role: "", company: "", email: "", notes: "" });
      setFormOpen(false);
      toast.success("Contact added");
    } catch {
      toast.error("Failed to add contact");
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/contacts/${id}`);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <AppShell>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-sm text-muted dark:text-muted-dark">
            Recruiters, referrals, and people you've networked with
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-lg font-medium"
        >
          <Plus size={16} /> Add Contact
        </button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleAdd}
          className="bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark rounded-xl p-4 mb-6 relative"
        >
          <button
            type="button"
            onClick={() => setFormOpen(false)}
            className="absolute top-3 right-3 text-muted dark:text-muted-dark"
          >
            <X size={18} />
          </button>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="p-2.5 rounded-lg bg-surface dark:bg-surface-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <input
              type="text"
              placeholder="Role (e.g. Recruiter)"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="p-2.5 rounded-lg bg-surface dark:bg-surface-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              type="text"
              placeholder="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="p-2.5 rounded-lg bg-surface dark:bg-surface-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="p-2.5 rounded-lg bg-surface dark:bg-surface-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <textarea
            placeholder="Notes (how you met, what you discussed...)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full p-2.5 rounded-lg bg-surface dark:bg-surface-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent mb-3"
          />
          <button
            type="submit"
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium text-sm"
          >
            Save Contact
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-muted dark:text-muted-dark">Loading...</p>
      ) : contacts.length === 0 ? (
        <p className="text-muted dark:text-muted-dark">
          No contacts yet — add recruiters or referrals you've connected with.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark rounded-xl p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  {c.role && (
                    <p className="text-sm text-muted dark:text-muted-dark">{c.role}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-muted dark:text-muted-dark hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {c.company && (
                <p className="text-xs flex items-center gap-1.5 text-muted dark:text-muted-dark mb-1">
                  <Building2 size={12} /> {c.company}
                </p>
              )}
              {c.email && (
                <a
                  href={`mailto:${c.email}`}
                  className="text-xs flex items-center gap-1.5 text-accent hover:underline mb-1"
                >
                  <Mail size={12} /> {c.email}
                </a>
              )}
              {c.notes && (
                <p className="text-sm text-muted dark:text-muted-dark mt-2 border-t border-border-subtle dark:border-border-subtle-dark pt-2">
                  {c.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default Contacts;