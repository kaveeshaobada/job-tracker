import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";

const columnAccents = {
  Applied: "border-t-4 border-t-blue-500",
  OA: "border-t-4 border-t-yellow-500",
  Interview: "border-t-4 border-t-purple-500",
  Offer: "border-t-4 border-t-green-500",
  Rejected: "border-t-4 border-t-red-500",
};

function KanbanColumn({ status, applications, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`bg-elevated dark:bg-elevated-dark rounded-xl ${columnAccents[status]} ${isOver ? "ring-2 ring-accent" : ""
        }`}
    >
      <div className="p-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-ink dark:text-ink-dark">{status}</h3>
        <span className="text-xs text-muted dark:text-muted-dark bg-surface dark:bg-surface-dark rounded-full px-2 py-0.5">
          {applications.length}
        </span>
      </div>
      <SortableContext
        items={applications.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="px-2 pb-2 space-y-2 min-h-15">
          {applications.map((app) => (
            <KanbanCard key={app.id} app={app} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default KanbanColumn;