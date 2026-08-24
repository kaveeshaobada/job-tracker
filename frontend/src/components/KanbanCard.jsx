import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, ExternalLink, Clock } from "lucide-react";
import { isPast } from "date-fns";
import Badge from "./ui/Badge";
import CompanyLogo from "./ui/CompanyLogo";

function KanbanCard({ app, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: app.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const overdue = app.followUpDate && isPast(new Date(app.followUpDate));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-surface dark:bg-surface-dark rounded-lg p-3 shadow-sm border border-border-subtle dark:border-border-subtle-dark cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex gap-2">
          <CompanyLogo company={app.company} size={24} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-sm text-ink dark:text-ink-dark truncate">
                {app.company}
              </p>
              {overdue && <Clock size={12} className="text-red-500 flex-shrink-0" />}
            </div>
            <p className="text-xs text-muted dark:text-muted-dark truncate">{app.role}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(app.id);
          }}
          className="text-muted dark:text-muted-dark hover:text-red-500 flex-shrink-0"
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
          className="text-xs text-accent hover:underline flex items-center gap-1 mt-2"
        >
          <ExternalLink size={10} /> Posting
        </a>
      )}
    </div>
  );
}

export default KanbanCard;