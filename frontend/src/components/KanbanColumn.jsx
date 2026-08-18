import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";

const columnStyles = {
  Applied: "border-t-blue-500",
  OA: "border-t-yellow-500",
  Interview: "border-t-purple-500",
  Offer: "border-t-green-500",
  Rejected: "border-t-red-500",
};

function KanbanColumn({ status, applications, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[260px] bg-gray-100 dark:bg-gray-800/50 rounded-xl border-t-4 ${columnStyles[status]} ${
        isOver ? "ring-2 ring-blue-400" : ""
      }`}
    >
      <div className="p-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">{status}</h3>
        <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">
          {applications.length}
        </span>
      </div>
      <SortableContext
        items={applications.map((a) => a.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="px-2 pb-2 space-y-2 min-h-[100px]">
          {applications.map((app) => (
            <KanbanCard key={app.id} app={app} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default KanbanColumn;