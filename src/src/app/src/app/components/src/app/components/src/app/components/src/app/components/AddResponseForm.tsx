import { useState } from 'react';
import { Send, X } from 'lucide-react';

interface AddResponseFormProps {
  onSubmit: (response: { author: string; content: string }) => void;
  onCancel: () => void;
  colorIndex: number;
}

const formColors = [
  { bg: 'bg-indigo-50', border: 'border-indigo-300', button: 'bg-indigo-600 hover:bg-indigo-700' },
  { bg: 'bg-purple-50', border: 'border-purple-300', button: 'bg-purple-600 hover:bg-purple-700' },
  { bg: 'bg-blue-50', border: 'border-blue-300', button: 'bg-blue-600 hover:bg-blue-700' },
];

export function AddResponseForm({ onSubmit, onCancel, colorIndex }: AddResponseFormProps) {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  const colors = formColors[colorIndex];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (author.trim() && content.trim()) {
      onSubmit({
        author: author.trim(),
        content: content.trim(),
      });
      setAuthor('');
      setContent('');
    }
  };

  return (
    <div className={`${colors.bg} ${colors.border} border-2 rounded-lg p-6 shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Add Your Response</h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="author" className="block text-sm font-semibold text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
            Your Response
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            required
          />
        </div>

        <button
          type="submit"
          className={`w-full ${colors.button} text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2`}
        >
          <Send className="w-4 h-4" />
          Add Response
        </button>
      </form>
    </div>
  );
}
