import { useState } from 'react';
import { Send, User, Clock } from 'lucide-react';
import type { Comment } from '../App';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (comment: { author: string; text: string }) => void;
}

export function CommentSection({ comments, onAddComment }: CommentSectionProps) {
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (author.trim() && text.trim()) {
      onAddComment({
        author: author.trim(),
        text: text.trim(),
      });
      setText('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6">
      {/* Existing Comments */}
      {comments.length > 0 && (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 rounded-full flex-shrink-0">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{comment.author}</span>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(comment.timestamp)}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            required
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add your thoughts..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Post</span>
          </button>
        </div>
      </form>
    </div>
  );
}
