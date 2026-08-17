import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import KanbanColumn from "./KanbanColumn";

const statuses = ["Applied", "OA", "Interview", "Offer", "Rejected"];

function KanbanBoard({ applications, onStatusChange, onDelete }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const appId = active.id;
    const newStatus = over.id;

    // over.id could be a column id (status) or another card's id
    const targetStatus = statuses.includes(newStatus)
      ? newStatus
      : applications.find((a) => a.id === newStatus)?.status;

    const app = applications.find((a) => a.id === appId);
    if (app && targetStatus && app.status !== targetStatus) {
      onStatusChange(appId, targetStatus);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statuses.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={applications.filter((a) => a.status === status)}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DndContext>
  );
}

export default KanbanBoard;