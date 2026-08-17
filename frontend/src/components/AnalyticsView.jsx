import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Briefcase, TrendingUp, Award, Send } from "lucide-react";
import api from "../api/client";
import StatCard from "./ui/StatCard";
import toast from "react-hot-toast";

const statusColorHex = {
  Applied: "#3b82f6",
  OA: "#eab308",
  Interview: "#a855f7",
  Offer: "#22c55e",
  Rejected: "#ef4444",
};

function AnalyticsView() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await api.get("/applications/stats");
        if (!ignore) setStats(res.data);
      } catch {
        if (!ignore) toast.error("Failed to load analytics");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) return <p className="text-gray-400">Loading analytics...</p>;
  if (!stats) return null;

  const pieData = Object.entries(stats.statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Applications" value={stats.total} icon={Briefcase} accent="blue" />
        <StatCard label="Response Rate" value={`${stats.responseRate}%`} icon={TrendingUp} accent="purple" />
        <StatCard label="Offer Rate" value={`${stats.offerRate}%`} icon={Award} accent="green" />
        <StatCard label="Applied This Period" value={stats.weeklyTrend.reduce((s, w) => s + w.count, 0)} icon={Send} accent="orange" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Applications per Week
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.weeklyTrend}>
              <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Status Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => entry.name}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={statusColorHex[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsView;