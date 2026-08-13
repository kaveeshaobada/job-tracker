import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, ExternalLink } from "lucide-react";
import Badge from "./ui/Badge";

function KanbanCard({ app, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: app.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {app.company}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{app.role}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(app.id);
          }}
          className="text-gray-300 hover:text-red-500 flex-shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {app.tags?.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-2">
          {app.tags.slice(0, 2).map((tag) => (
            <Badge key={tag.id} color={tag.color}>
              {tag.name}
            </Badge>
          ))}
        </div>
      )}
      {app.link && (
        
        <a
          href={app.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-2"
        >
          <ExternalLink size={10} /> Posting
        </a>
      )}
    </div>
  );
}

export default KanbanCard;