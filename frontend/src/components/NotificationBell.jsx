import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Trash2, X, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import toast from "react-hot-toast";

function NotificationBell({ align = "right" }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // Silently swallow background fetch errors
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error("Failed to update notification");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const handleSelectNotification = (n) => {
    if (!n.isRead) {
      handleMarkAsRead(n.id);
    }
    setOpen(false);
    if (n.applicationId) {
      navigate(`/?highlight=${n.applicationId}`);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) fetchNotifications();
        }}
        className="relative p-2 rounded-lg text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-dark hover:bg-elevated dark:hover:bg-elevated-dark transition-colors"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute ${
            align === "left" ? "left-0 sm:-left-4" : "right-0"
          } mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-surface dark:bg-surface-dark border border-border-subtle dark:border-border-subtle-dark rounded-xl shadow-xl z-50 overflow-hidden`}
        >
          <div className="flex items-center justify-between p-3 border-b border-border-subtle dark:border-border-subtle-dark bg-elevated dark:bg-elevated-dark">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-accent" />
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-accent/15 text-accent text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-muted dark:text-muted-dark hover:text-accent flex items-center gap-1 p-1 rounded"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} /> Read all
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-dark p-1"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle dark:divide-border-subtle-dark">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted dark:text-muted-dark">
                <Calendar size={28} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">No notifications yet.</p>
                <p className="text-[11px] mt-1 text-muted dark:text-muted-dark">
                  Reminders for upcoming application dates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleSelectNotification(n)}
                  className={`p-3 cursor-pointer transition-colors flex items-start justify-between gap-2 hover:bg-elevated dark:hover:bg-elevated-dark ${
                    !n.isRead ? "bg-accent/5" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                      )}
                      <p className="text-xs font-semibold truncate">{n.title}</p>
                    </div>
                    <p className="text-xs text-ink/80 dark:text-ink-dark/80 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-muted dark:text-muted-dark mt-1">
                      {new Date(n.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        className="text-muted hover:text-accent p-1"
                        title="Mark as read"
                      >
                        <CheckCheck size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(n.id, e)}
                      className="text-muted hover:text-red-500 p-1"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
