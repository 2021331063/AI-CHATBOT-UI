import React, { useState } from "react";
import Markdown from "react-markdown";

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  
  const previewText =
    item.type === "text"
      ? item.content.slice(0, 150) + (item.content.length > 150 ? "..." : "")
      : null;

  return (
    <div className="p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2>{item.prompt}</h2>
          <p className="text-gray-500">
            {item.type} - {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      <div className="mt-3 max-w-md mx-auto">
        {item.type === "image" ? (
          <img
            src={item.content}
            alt="image"
            className={`w-full max-w-md rounded ${
              !expanded ? "h-32 object-cover" : ""
            }`}
          />
        ) : (
          <div className="reset-tw mt-3 text-sm text-slate-700">
            <Markdown>{expanded ? item.content : previewText}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreationItem;
