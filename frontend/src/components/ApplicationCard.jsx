const statusColors = {
  Applied: "bg-blue-500",
  OA: "bg-yellow-500",
  Interview: "bg-purple-500",
  Offer: "bg-green-500",
  Rejected: "bg-red-500",
};

function ApplicationCard({ app, onStatusChange, onDelete }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
      <div>
        <h3 className="font-semibold text-lg">{app.company}</h3>
        <p className="text-gray-400 text-sm">{app.role}</p>
        {app.link && (
          <a
            href={app.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 text-xs hover:underline"
          >
            View posting
          </a>
        )}
      </div>
      <div className="flex items-center gap-3">
        <select
          value={app.status}
          onChange={(e) => onStatusChange(app.id, e.target.value)}
          className={`text-xs font-medium px-2 py-1 rounded text-white ${statusColors[app.status]}`}
        >
          {Object.keys(statusColors).map((s) => (
            <option key={s} value={s} className="text-black">
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={() => onDelete(app.id)}
          className="text-gray-500 hover:text-red-400 text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default ApplicationCard;