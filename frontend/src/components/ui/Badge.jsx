const colorMap = {
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  green: "bg-green-500/15 text-green-400 border-green-500/30",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  orange: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  red: "bg-red-500/15 text-red-400 border-red-500/30",
  gray: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

function Badge({ children, color = "gray", onRemove }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colorMap[color]}`}
    >
      {children}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-white ml-0.5">
          ×
        </button>
      )}
    </span>
  );
}

export default Badge;