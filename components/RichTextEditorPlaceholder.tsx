
import React from 'react';

interface RichTextEditorPlaceholderProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const RichTextEditorPlaceholder: React.FC<RichTextEditorPlaceholderProps> = ({ value, onChange, label }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="p-4 border border-dashed border-gray-400 rounded-md bg-gray-50 text-center">
        <p className="text-sm text-gray-500 mb-2">
          Rich Text Editor (e.g., React-Quill or TinyMCE) would be here.
        </p>
        <p className="text-xs text-gray-400 mb-2">
          Features: Bold, Italic, Lists, Image Upload, Video Embed, PDF Upload, etc.
        </p>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter lesson content here..."
        />
      </div>
    </div>
  );
};

export default RichTextEditorPlaceholder;
