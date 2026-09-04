import { Target } from "lucide-react";

function WeeklyGoalBar({ current, goal }) {
    const pct = Math.min(100, Math.round((current / goal) * 100));
    const metGoal = current >= goal;

    return (
        <div className="bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Target size={16} className="text-accent" />
                    <p className="text-sm font-medium">Weekly Goal</p>
                </div>
                <p className={`text-sm font-semibold ${metGoal ? "text-green-500" : "text-muted dark:text-muted-dark"}`}>
                    {current} / {goal}
                </p>
            </div>
            <div className="h-2 rounded-full bg-surface dark:bg-surface-dark overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${metGoal ? "bg-green-500" : "bg-accent"}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {metGoal && (
                <p className="text-xs text-green-500 mt-1.5">🎉 Goal reached this week!</p>
            )}
        </div>
    );
}

export default WeeklyGoalBar;