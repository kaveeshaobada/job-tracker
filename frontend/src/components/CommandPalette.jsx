import { useEffect, useState, useMemo } from "react";
import { Command } from "cmdk";
import { Search, Building2 } from "lucide-react";
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
        className="bg-surface dark:bg-surface-dark rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-border-subtle dark:border-border-subtle-dark"
        onClick={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle dark:border-border-subtle-dark">
            <Search size={16} className="text-muted dark:text-muted-dark" />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search company, role, or tag..."
              className="flex-1 bg-transparent outline-none text-sm text-ink dark:text-ink-dark placeholder-muted dark:placeholder-muted-dark"
            />
            <kbd className="text-xs text-muted dark:text-muted-dark bg-elevated dark:bg-elevated-dark px-1.5 py-0.5 rounded">
              Esc
            </kbd>
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 && (
              <p className="text-sm text-muted dark:text-muted-dark text-center py-6">No applications found</p>
            )}
            {results.map((app) => (
              <Command.Item
                key={app.id}
                onSelect={() => {
                  onSelectApplication(app.id);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer data-[selected=true]:bg-elevated dark:data-[selected=true]:bg-elevated-dark"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 size={16} className="text-muted dark:text-muted-dark flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink dark:text-ink-dark truncate">
                      {app.company}
                    </p>
                    <p className="text-xs text-muted dark:text-muted-dark truncate">{app.role}</p>
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