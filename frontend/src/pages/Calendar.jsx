import { useEffect, useState } from "react";
import { isPast, isToday, isThisWeek, format } from "date-fns";
import { Clock, CalendarDays } from "lucide-react";
import api from "../api/client";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/ui/StatusBadge";
import CompanyLogo from "../components/ui/CompanyLogo";
import toast from "react-hot-toast";

function groupEvents(events) {
  const groups = { overdue: [], today: [], thisWeek: [], later: [] };
  events.forEach((e) => {
    const date = new Date(e.followUpDate);
    if (isPast(date) && !isToday(date)) groups.overdue.push(e);
    else if (isToday(date)) groups.today.push(e);
    else if (isThisWeek(date)) groups.thisWeek.push(e);
    else groups.later.push(e);
  });
  return groups;
}

function EventRow({ event }) {
  return (
    <div className="flex items-center gap-3 bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark rounded-lg p-3">
      <CompanyLogo company={event.company} size={32} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{event.company}</p>
        <p className="text-xs text-muted dark:text-muted-dark truncate">{event.role}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-muted dark:text-muted-dark mb-1">
          {format(new Date(event.followUpDate), "MMM d, yyyy")}
        </p>
        <StatusBadge status={event.status} />
      </div>
    </div>
  );
}

function EventGroup({ title, events, accent }) {
  if (events.length === 0) return null;
  return (
    <div className="mb-6">
      <h2 className={`text-sm font-semibold mb-2 ${accent}`}>
        {title} ({events.length})
      </h2>
      <div className="space-y-2">
        {events.map((e) => (
          <EventRow key={e.id} event={e} />
        ))}
      </div>
    </div>
  );
}

function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    api
      .get("/applications/upcoming")
      .then((res) => {
        if (!ignore) setEvents(res.data);
      })
      .catch(() => toast.error("Failed to load calendar"))
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const groups = groupEvents(events);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-sm text-muted dark:text-muted-dark">
          Follow-ups and interviews across all your applications
        </p>
      </div>

      {loading ? (
        <p className="text-muted dark:text-muted-dark">Loading...</p>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <CalendarDays size={32} className="mx-auto text-muted dark:text-muted-dark mb-2" />
          <p className="text-muted dark:text-muted-dark">
            No upcoming dates. Set a follow-up date when adding an application.
          </p>
        </div>
      ) : (
        <>
          <EventGroup title="Overdue" events={groups.overdue} accent="text-red-500" />
          <EventGroup title="Today" events={groups.today} accent="text-accent" />
          <EventGroup title="This Week" events={groups.thisWeek} accent="text-yellow-500" />
          <EventGroup title="Later" events={groups.later} accent="text-muted dark:text-muted-dark" />
        </>
      )}
    </AppShell>
  );
}

export default Calendar;