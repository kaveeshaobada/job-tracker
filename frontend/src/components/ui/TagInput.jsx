import { useState } from "react";
import { X } from "lucide-react";
import Badge from "./Badge";

const colors = ["blue", "green", "purple", "orange", "red", "gray"];

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState("");

  const addTag = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    if (tags.length >= 10) return;
    onChange([...tags, trimmed]);
    setInput("");
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag, i) => (
          <Badge key={tag} color={colors[i % colors.length]} onRemove={() => removeTag(tag)}>
            {tag}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTag(e);
          }}
          placeholder="Add a tag and press Enter (e.g. Referral, Remote)"
          className="flex-1 text-sm p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

export default TagInput;