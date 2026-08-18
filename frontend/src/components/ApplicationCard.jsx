import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink, Trash2, Clock, MessageSquarePlus } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import StatusBadge from "./ui/StatusBadge";
import Badge from "./ui/Badge";
import api from "../api/client";
import toast from "react-hot-toast";
import CompanyLogo from "./ui/CompanyLogo";
import { Paperclip, FileText, Upload } from "lucide-react";

const statusOptions = ["Applied", "OA", "Interview", "Offer", "Rejected"];

function ApplicationCard({ app, onStatusChange, onDelete, onNoteAdded, onAttachmentAdded, onAttachmentDeleted }) {
  const [expanded, setExpanded] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  const overdue = app.followUpDate && isPast(new Date(app.followUpDate));

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSubmittingNote(true);
    try {
      const res = await api.post(`/applications/${app.id}/notes`, { content: noteText });
      onNoteAdded(app.id, res.data);
      setNoteText("");
      toast.success("Note added");
    } catch {
      toast.error("Failed to add note");
    } finally {
      setSubmittingNote(false);
    }
  };

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post(`/applications/${app.id}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onAttachmentAdded(app.id, res.data);
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <motion.div
      id={`app-${app.id}`}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
    >
      <div className="p-4 flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0 flex gap-3">
          <CompanyLogo company={app.company} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {app.company}
              </h3>
              {overdue && (
                <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                  <Clock size={12} /> Follow up
                </span>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{app.role}</p>

            <div className="flex items-center gap-2 flex-wrap mt-2">
              {app.tags?.map((tag) => (
                <Badge key={tag.id} color={tag.color}>
                  {tag.name}
                </Badge>
              ))}
              {app.link && (
                <a
                  href={app.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={12} /> Posting
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={app.status}
            onChange={(e) => onStatusChange(app.id, e.target.value)}
            className="bg-transparent border-none text-xs cursor-pointer"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s} className="text-black">
                {s}
              </option>
            ))}
          </select>
          <StatusBadge status={app.status} />
          <button
            onClick={() => onDelete(app.id)}
            className="text-gray-400 hover:text-red-500 p-1"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
          >
            <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
              <ChevronDown size={18} />
            </motion.div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-900/50"
          >
            <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
              {app.activityLogs?.length ? (
                app.activityLogs.map((log) => (
                  <div key={log.id} className="text-sm">
                    <p className="text-gray-700 dark:text-gray-300">{log.content}</p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">No notes yet</p>
              )}
            </div>

            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Attachments</p>
              {app.attachments?.length > 0 && (
                <div className="space-y-1 mb-2">
                  {app.attachments.map((file) => (
                    <div key={file.id} className="flex items-center justify-between text-sm bg-white dark:bg-gray-800 rounded p-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-500 hover:underline truncate"
                      >
                        <FileText size={14} /> {file.fileName}
                      </a>
                      <button
                        onClick={async () => {
                          await api.delete(`/applications/${app.id}/attachments/${file.id}`);
                          onAttachmentDeleted(app.id, file.id);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center gap-2 text-xs text-blue-500 cursor-pointer hover:underline">
                {uploading ? <Upload size={14} className="animate-pulse" /> : <Paperclip size={14} />}
                {uploading ? "Uploading..." : "Attach resume/cover letter"}
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 text-sm p-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={submittingNote}
                className="text-blue-500 hover:text-blue-600 disabled:opacity-50 p-2"
              >
                <MessageSquarePlus size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ApplicationCard;