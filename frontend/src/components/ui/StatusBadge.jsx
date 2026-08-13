const statusStyles = {
  Applied: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  OA: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Interview: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Offer: "bg-green-500/15 text-green-400 border-green-500/30",
  Rejected: "bg-red-500/15 text-red-400 border-red-500/30",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;