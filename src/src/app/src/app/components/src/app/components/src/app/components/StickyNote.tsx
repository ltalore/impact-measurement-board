import { useState } from 'react';
import { MessageCircle, User, StickyNote as StickyNoteIcon } from 'lucide-react';
import { CommentSection } from './CommentSection';
import type { Response, Comment } from '../App';

interface StickyNoteProps {
  response: Response;
  onAddComment: (responseId: string, comment: { author: string; text: string }) => void;
  colorIndex: number;
}

const stickyColors = [
  { bg: 'bg-yellow-200', border: 'border-yellow-300', shadow: 'shadow-yellow-300/50' },
  { bg: 'bg-pink-200', border: 'border-pink-300', shadow: 'shadow-pink-300/50' },
  { bg: 'bg-blue-200', border: 'border-blue-300', shadow: 'shadow-blue-300/50' },
  { bg: 'bg-green-200', border: 'border-green-300', shadow: 'shadow-green-300/50' },
  { bg: 'bg-purple-200', border: 'border-purple-300', shadow: 'shadow-purple-300/50' },
];

const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-0'];

export function StickyNote({ response, onAddComment, colorIndex }: StickyNoteProps) {
  const [showComments, setShowComments] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const color = stickyColors[colorIndex];
  const rotation = rotations[colorIndex];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div 
      className={`relative ${rotation} transition-all duration-300 ${isHovered ? 'scale-105 rotate-0 z-10' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sticky Note */}
      <div className={`${color.bg} ${color.border} border-2 rounded-sm shadow-lg ${color.shadow} p-6 min-h-[200px] flex flex-col`}>
        {/* Tape effect at top */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/40 border border-gray-300/50 rotate-0 shadow-sm"></div>
        
        {/* Header */}
        <div className="mb-3 pb-3 border-b-2 border-gray-400/30">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-gray-700" />
            <h3 className="font-bold text-gray-900">{response.author}</h3>
          </div>
          <p className="text-xs text-gray-600">{formatDate(response.timestamp)}</p>
        </div>

        {/* Content */}
        <div className="flex-1 mb-3">
          <p className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap break-words">
            {response.content}
          </p>
        </div>

        {/* Comments Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="pt-3 border-t-2 border-gray-400/30 flex items-center justify-between hover:bg-black/5 -mx-6 px-6 py-2 transition-colors"
        >
          <span className="font-semibold text-gray-700 flex items-center gap-2 text-xs">
            <MessageCircle className="w-4 h-4" />
            {response.comments.length === 0
              ? 'Add comment'
              : `${response.comments.length} ${response.comments.length === 1 ? 'comment' : 'comments'}`}
          </span>
          <StickyNoteIcon className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Comments Modal/Popup */}
      {showComments && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowComments(false)}
          ></div>
          
          {/* Comments Panel */}
          <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white rounded-lg shadow-2xl z-50 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Comments - {response.author}</h3>
                <p className="text-sm text-gray-600">Discussion and additional thoughts</p>
              </div>
              <button
                onClick={() => setShowComments(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CommentSection
                comments={response.comments}
                onAddComment={(comment) => onAddComment(response.id, comment)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
