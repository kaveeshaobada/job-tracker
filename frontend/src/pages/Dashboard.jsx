import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import ApplicationCard from "../components/ApplicationCard";
import AddApplicationForm from "../components/AddApplicationForm";

function Dashboard() {
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchApplications = async () => {
    try {
      const res = await api.get("/applications");
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
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

  const filtered =
    filter === "All" ? applications : applications.filter((a) => a.status === filter);

  const statuses = ["All", "Applied", "OA", "Interview", "Offer", "Rejected"];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user?.email}</h1>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Log Out
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded text-sm ${
                filter === s ? "bg-blue-600" : "bg-gray-800 text-gray-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <AddApplicationForm onAdd={handleAdd} />
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400">No applications yet.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;