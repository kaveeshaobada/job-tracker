import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import ApplicationCard from "../components/ApplicationCard";
import AddApplicationForm from "../components/AddApplicationForm";
import toast from "react-hot-toast";
import { LayoutGrid, List, BarChart3 } from "lucide-react";
import KanbanBoard from "../components/KanbanBoard";
import AnalyticsView from "../components/AnalyticsView";

function Dashboard() {
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState("list"); // "list" | "kanban" | "analytics"

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await api.get("/applications");
        if (!ignore) setApplications(res.data);
      } catch {
        if (!ignore) toast.error("Failed to load applications");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleAdd = async (data) => {
    const res = await api.post("/applications", data);
    setApplications((prev) => [res.data, ...prev]);
  };

  const handleStatusChange = async (id, status) => {
    const app = applications.find((a) => a.id === id);
    const res = await api.put(`/applications/${id}`, { ...app, status });
    setApplications((prev) => prev.map((a) => (a.id === id ? res.data : a)));
  };

  const handleDelete = async (id) => {
    await api.delete(`/applications/${id}`);
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  const handleNoteAdded = (appId, note) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId ? { ...a, activityLogs: [note, ...(a.activityLogs || [])] } : a
      )
    );
  };

  const filtered =
    filter === "All" ? applications : applications.filter((a) => a.status === filter);

  const statuses = ["All", "Applied", "OA", "Interview", "Offer", "Rejected"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user?.email}</h1>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Log Out
        </button>
      </div>

      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded text-sm ${
                filter === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded ${view === "list" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500"}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`p-1.5 rounded ${view === "kanban" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500"}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView("analytics")}
            className={`p-1.5 rounded ${view === "analytics" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500"}`}
          >
            <BarChart3 size={16} />
          </button>
        </div>

        <AddApplicationForm onAdd={handleAdd} />
      </div>

      {view === "analytics" ? (
        <AnalyticsView />
      ) : loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400">No applications yet.</p>
      ) : view === "kanban" ? (
        <KanbanBoard
          applications={filtered}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onNoteAdded={handleNoteAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;