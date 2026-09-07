import { useEffect, useState } from "react";
import api from "../api/client";
import AppShell from "../components/AppShell";
import toast from "react-hot-toast";
import { Plus, Trash2, Mail, Building2, X, Pencil } from "lucide-react";
import EditContactForm from "../components/EditContactForm";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";

function Contacts() {
  const { isDemoActive, demoData } = useOnboarding() || {};
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", company: "", email: "", notes: "", applicationId: "" });
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();
  const [editingContact, setEditingContact] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleContactUpdated = (updated) => {
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? { ...updated, application: c.application } : c)));
  };

  useEffect(() => {
    let ignore = false;
    Promise.all([api.get("/contacts"), api.get("/applications")])
      .then(([contactsRes, appsRes]) => {
        if (!ignore) {
          setContacts(contactsRes.data);
          setApplications(appsRes.data);
        }
      })
      .catch(() => toast.error("Failed to load contacts"))
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const highlightId = searchParams.get("highlight");
    if (highlightId && contacts.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`contact-${highlightId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-2", "ring-accent");
          setTimeout(() => el.classList.remove("ring-2", "ring-accent"), 1500);
        }
      }, 200);
      setSearchParams({});
    }
  }, [contacts, searchParams]);


  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      const res = await api.post("/contacts", {
        ...form,
        applicationId: form.applicationId || null,
      });
      setContacts((prev) => [res.data, ...prev]);
      setForm({ name: "", role: "", company: "", email: "", notes: "", applicationId: "" });
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

  const activeContacts = (isDemoActive && contacts.length === 0) ? demoData.contacts : contacts;
  const activeApplications = (isDemoActive && applications.length === 0) ? demoData.applications : applications;

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
          data-tour="add-contact"
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-lg font-medium whitespace-nowrap"
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
          <select
            value={form.applicationId}
            onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
            className="w-full p-2.5 rounded-lg bg-surface dark:bg-surface-dark border border-border-subtle dark:border-border-subtle-dark focus:outline-none focus:ring-2 focus:ring-accent mb-3"
          >
            <option value="">Not linked to an application</option>
            {activeApplications.map((a) => (
              <option key={a.id} value={a.id}>
                {a.company} — {a.role}
              </option>
            ))}
          </select>
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
      ) : activeContacts.length === 0 ? (
        <p className="text-muted dark:text-muted-dark">
          No contacts yet — add recruiters or referrals you've connected with.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeContacts.map((c) => (
            <div
              key={c.id}
              id={`contact-${c.id}`}
              className="bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark rounded-xl p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{c.name}</h3>
                  {c.role && (
                    <p className="text-sm text-muted dark:text-muted-dark truncate">{c.role}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setEditingContact(c)}
                    className="text-muted dark:text-muted-dark hover:text-accent p-1"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-muted dark:text-muted-dark hover:text-red-500 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
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
              {c.application && (
                <button
                  onClick={() => navigate(`/?highlight=${c.applicationId}`)}
                  className="text-xs flex items-center gap-1.5 text-accent hover:underline mt-1"
                >
                  <Building2 size={12} /> {c.application.company} — {c.application.role}
                </button>
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

      {editingContact && (
        <EditContactForm
          contact={editingContact}
          applications={applications}
          onClose={() => setEditingContact(null)}
          onUpdated={handleContactUpdated}
        />
      )}
    </AppShell>
  );
}

export default Contacts;