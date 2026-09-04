import { useState } from "react";
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isSameDay,
    isToday,
    addMonths,
    subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CompanyLogo from "./ui/CompanyLogo";

function CalendarGrid({ events }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart);
    const gridEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

    const eventsByDay = (day) =>
        events.filter((e) => isSameDay(new Date(e.followUpDate), day));

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                    className="p-2 rounded-lg hover:bg-elevated dark:hover:bg-elevated-dark"
                >
                    <ChevronLeft size={18} />
                </button>
                <h2 className="font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
                <button
                    onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                    className="p-2 rounded-lg hover:bg-elevated dark:hover:bg-elevated-dark"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="text-xs font-medium text-muted dark:text-muted-dark text-center py-1">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                    const dayEvents = eventsByDay(day);
                    const inMonth = isSameMonth(day, currentMonth);
                    return (
                        <div
                            key={day.toISOString()}
                            className={`min-h-20 rounded-lg border border-border-subtle dark:border-border-subtle-dark p-1.5 ${inMonth ? "bg-elevated dark:bg-elevated-dark" : "bg-surface dark:bg-surface-dark opacity-40"
                                } ${isToday(day) ? "ring-2 ring-accent" : ""}`}
                        >
                            <p className={`text-xs mb-1 ${isToday(day) ? "text-accent font-semibold" : "text-muted dark:text-muted-dark"}`}>
                                {format(day, "d")}
                            </p>
                            <div className="space-y-1">
                                {dayEvents.slice(0, 2).map((e) => (
                                    <div
                                        key={e.id}
                                        title={`${e.company} — ${e.role}`}
                                        className="flex items-center gap-1 bg-surface dark:bg-surface-dark rounded px-1 py-0.5 overflow-hidden"
                                    >
                                        <CompanyLogo company={e.company} size={12} />
                                        <span className="text-xs truncate">{e.company}</span>
                                    </div>
                                ))}
                                {dayEvents.length > 2 && (
                                    <p className="text-xs text-muted dark:text-muted-dark px-1">
                                        +{dayEvents.length - 2} more
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CalendarGrid;