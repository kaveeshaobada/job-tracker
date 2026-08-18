import { useEffect, useState, useMemo } from "react";
import { Command } from "cmdk";
import { Search, Building2, ExternalLink } from "lucide-react";
import StatusBadge from "./ui/StatusBadge";

function CommandPalette({ applications, onSelectApplication }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return applications.slice(0, 8);
    const q = query.toLowerCase();
    return applications.filter(
      (a) =>
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.tags?.some((t) => t.name.toLowerCase().includes(q))
    );
  }, [query, applications]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center pt-24 z-50"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <Search size={16} className="text-gray-400" />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search company, role, or tag..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
            />
            <kbd className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
              Esc
            </kbd>
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No applications found</p>
            )}
            {results.map((app) => (
              <Command.Item
                key={app.id}
                onSelect={() => {
                  onSelectApplication(app.id);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer data-[selected=true]:bg-gray-100 dark:data-[selected=true]:bg-gray-700"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 size={16} className="text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {app.company}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{app.role}</p>
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

export default CommandPalette;