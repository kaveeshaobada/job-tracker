import { ChevronDown } from "lucide-react";

export const statusStyles = {
  Applied: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  OA: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Interview: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Offer: "bg-green-500/15 text-green-400 border-green-500/30",
  Rejected: "bg-red-500/15 text-red-400 border-red-500/30",
};

function StatusBadge({ status, onChange, options = ["Applied", "OA", "Interview", "Offer", "Rejected"] }) {
  if (onChange) {
    return (
      <div className="relative inline-flex items-center">
        <select
          value={status}
          onChange={(e) => onChange(e.target.value)}
          className={`appearance-none cursor-pointer pl-2.5 pr-6 py-1 rounded-full text-xs font-semibold border ${
            statusStyles[status] || statusStyles.Applied
          } focus:outline-none focus:ring-1 focus:ring-accent transition-colors`}
        >
          {options.map((s) => (
            <option key={s} value={s} className="bg-surface-dark text-white">
              {s}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-75"
        />
      </div>
    );
  }

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
        statusStyles[status] || statusStyles.Applied
      }`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;