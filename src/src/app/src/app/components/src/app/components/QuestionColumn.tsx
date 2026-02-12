import { useState } from 'react';
import { Plus } from 'lucide-react';
import { StickyNote } from './StickyNote';
import { AddResponseForm } from './AddResponseForm';
import type { Response, Comment } from '../App';

interface Question {
  id: number;
  title: string;
  description: string;
}

interface QuestionColumnProps {
  question: Question;
  responses: Response[];
  onAddResponse: (questionId: number, response: { author: string; content: string }) => void;
  onAddComment: (responseId: string, comment: { author: string; text: string }) => void;
  colorIndex: number;
}

const columnColors = [
  { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-900', button: 'bg-indigo-600 hover:bg-indigo-700' },
  { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900', button: 'bg-purple-600 hover:bg-purple-700' },
  { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900', button: 'bg-blue-600 hover:bg-blue-700' },
];

export function QuestionColumn({ question, responses, onAddResponse, onAddComment, colorIndex }: QuestionColumnProps) {
  const [showForm, setShowForm] = useState(false);
  const colors = columnColors[colorIndex];

  const handleSubmit = (response: { author: string; content: string }) => {
    onAddResponse(question.id, response);
    setShowForm(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={`${colors.bg} ${colors.border} border-2 rounded-lg p-6 mb-6 shadow-md`}>
        <div className="flex items-start justify-between mb-3">
          <h2 className={`text-xl font-bold ${colors.text}`}>
            Question {question.id}
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`${colors.button} text-white p-2 rounded-lg transition-colors shadow-sm`}
            title="Add response"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>
          {question.title}
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          {question.description}
        </p>
      </div>

      {/* Add Response Form */}
      {showForm && (
        <div className="mb-6">
          <AddResponseForm
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            colorIndex={colorIndex}
          />
        </div>
      )}

      {/* Sticky Notes Container */}
      <div className="flex-1 space-y-6 min-h-[400px]">
        {responses.length === 0 && !showForm && (
          <div className="bg-white/50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">No responses yet. Click + to add one!</p>
          </div>
        )}
        
        {responses.map((response, index) => (
          <StickyNote
            key={response.id}
            response={response}
            onAddComment={onAddComment}
            colorIndex={(colorIndex * 2 + index) % 5}
          />
        ))}
      </div>
    </div>
  );
}
