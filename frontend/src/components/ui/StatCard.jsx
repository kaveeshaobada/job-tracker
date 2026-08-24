function StatCard({ label, value, icon: Icon, accent = "blue" }) {
  const accentMap = {
    blue: "text-blue-500 bg-blue-500/10",
    green: "text-green-500 bg-green-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    orange: "text-orange-500 bg-orange-500/10",
  };

  return (
    <div className="bg-elevated dark:bg-elevated-dark border border-border-subtle dark:border-border-subtle-dark rounded-xl p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${accentMap[accent]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-ink dark:text-ink-dark">{value}</p>
        <p className="text-xs text-muted dark:text-muted-dark">{label}</p>
      </div>
    </div>
  );
}

export default StatCard;