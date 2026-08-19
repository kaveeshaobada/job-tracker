import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Applications", icon: LayoutDashboard },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/settings", label: "Settings", icon: Settings },
];

function AppShell({ children }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-accent/10 text-accent"
        : "text-muted dark:text-muted-dark hover:bg-elevated dark:hover:bg-elevated-dark"
    }`;

  return (
    <div className="min-h-screen flex bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-surface dark:bg-surface-dark border-b border-border-subtle dark:border-border-subtle-dark flex items-center justify-between px-4 z-40">
        <span className="font-semibold">JobTrack</span>
        <button onClick={() => setMobileOpen(true)}>
          <Menu size={22} />
        </button>
      </div>

      {/* Sidebar - desktop always visible, mobile as overlay */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-elevated dark:bg-elevated-dark border-r border-border-subtle dark:border-border-subtle-dark flex flex-col p-4 z-50 transition-transform md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-6 px-1">
          <span className="font-bold text-lg">JobTrack</span>
          <button className="md:hidden" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border-subtle dark:border-border-subtle-dark pt-3 mt-3">
          <p className="text-xs text-muted dark:text-muted-dark truncate px-3 mb-2">
            {user?.email}
          </p>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted dark:text-muted-dark hover:bg-red-500/10 hover:text-red-500 w-full"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0 pt-14 md:pt-0 p-4 md:p-8">{children}</main>
    </div>
  );
}

export default AppShell;