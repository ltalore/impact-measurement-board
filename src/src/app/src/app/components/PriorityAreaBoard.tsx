import { Target } from 'lucide-react';
import { QuestionColumn } from './QuestionColumn';
import type { PriorityArea, Response, Comment } from '../App';

interface PriorityAreaBoardProps {
  area: PriorityArea;
  responses: Response[];
  onAddResponse: (questionId: number, response: { author: string; content: string }) => void;
  onAddComment: (responseId: string, comment: { author: string; text: string }) => void;
}

const questions = [
  {
    id: 1,
    title: "What are you measuring?",
    description: "What are you measuring to ensure that you are getting to the intended impact?",
  },
  {
    id: 2,
    title: "How will you know?",
    description: "How will you know that you have achieved these outcomes?",
  },
  {
    id: 3,
    title: "What and how to measure?",
    description: "What and how will you measure?",
  },
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; border: string; accent: string }> = {
    indigo: { bg: 'bg-indigo-600', border: 'border-indigo-600', accent: 'bg-indigo-100' },
    purple: { bg: 'bg-purple-600', border: 'border-purple-600', accent: 'bg-purple-100' },
    blue: { bg: 'bg-blue-600', border: 'border-blue-600', accent: 'bg-blue-100' },
    emerald: { bg: 'bg-emerald-600', border: 'border-emerald-600', accent: 'bg-emerald-100' },
    amber: { bg: 'bg-amber-600', border: 'border-amber-600', accent: 'bg-amber-100' },
    rose: { bg: 'bg-rose-600', border: 'border-rose-600', accent: 'bg-rose-100' },
  };
  return colors[color] || colors.indigo;
};

export function PriorityAreaBoard({ area, responses, onAddResponse, onAddComment }: PriorityAreaBoardProps) {
  const colors = getColorClasses(area.color);

  const getResponsesForQuestion = (questionId: number) => {
    return responses.filter(r => r.questionId === questionId);
  };

  return (
    <div className="max-w-[1800px] mx-auto">
      {/* Header */}
      <div className={`bg-white rounded-xl shadow-lg p-8 mb-8 border-l-8 ${colors.border}`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 ${colors.accent} rounded-lg`}>
            <Target className={`w-8 h-8 ${colors.bg.replace('bg-', 'text-')}`} />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {area.title}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {area.description}
            </p>
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {questions.map((question, index) => (
          <QuestionColumn
            key={question.id}
            question={question}
            responses={getResponsesForQuestion(question.id)}
            onAddResponse={onAddResponse}
            onAddComment={onAddComment}
            colorIndex={index}
          />
        ))}
      </div>
    </div>
  );
}
