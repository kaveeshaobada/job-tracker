import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  Menu,
  X,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useOnboarding } from "../context/OnboardingContext";
import NotificationBell from "./NotificationBell";

const navItems = [
  { to: "/", label: "Applications", icon: LayoutDashboard, tourKey: "nav-applications" },
  { to: "/contacts", label: "Contacts", icon: Users, tourKey: "nav-contacts" },
  { to: "/calendar", label: "Calendar", icon: Calendar, tourKey: "nav-calendar" },
  { to: "/settings", label: "Settings", icon: Settings, tourKey: "nav-settings" },
];

function AppShell({ children }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { startTour, isActive, nextStep } = useOnboarding();

  useEffect(() => {
    const handleOpenMenu = () => setMobileOpen(true);
    const handleCloseMenu = () => setMobileOpen(false);

    window.addEventListener("jobtrack-open-mobile-menu", handleOpenMenu);
    window.addEventListener("jobtrack-close-mobile-menu", handleCloseMenu);

    return () => {
      window.removeEventListener("jobtrack-open-mobile-menu", handleOpenMenu);
      window.removeEventListener("jobtrack-close-mobile-menu", handleCloseMenu);
    };
  }, []);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
      ? "bg-accent/10 text-accent"
      : "text-muted dark:text-muted-dark hover:bg-elevated dark:hover:bg-elevated-dark"
    }`;

  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-surface dark:bg-surface-dark border-b border-border-subtle dark:border-border-subtle-dark flex items-center justify-between px-4 z-40">
        <span className="font-semibold">JobTrack</span>
        <div className="flex items-center gap-2">
          <NotificationBell align="right" />
          <button onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Sidebar - desktop always visible, mobile as overlay */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-elevated dark:bg-elevated-dark border-r border-border-subtle dark:border-border-subtle-dark flex flex-col p-4 transition-transform md:translate-x-0 z-50 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-6 px-1">
          <span className="font-bold text-lg">JobTrack</span>
          <div className="flex items-center gap-1">
            <NotificationBell align="left" />
            <button className="md:hidden" onClick={() => setMobileOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={linkClass}
              data-tour={item.tourKey}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => {
            setMobileOpen(false);
            startTour();
          }}
          data-tour="restart-tour"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted dark:text-muted-dark hover:bg-surface dark:hover:bg-surface-dark w-full mb-1 transition-colors"
        >
          <HelpCircle size={18} />
          Take Tour
        </button>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted dark:text-muted-dark hover:bg-surface dark:hover:bg-surface-dark w-full mb-1 transition-colors"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>

        <div className="border-t border-border-subtle dark:border-border-subtle-dark pt-3 mt-3">
          <div className="flex items-center gap-2 px-3 mb-2">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {(user?.name?.[0] || user?.email?.[0] || "?").toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{user?.name || "Set your name"}</p>
              <p className="text-xs text-muted dark:text-muted-dark truncate">{user?.email}</p>
            </div>
          </div>
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