import React from 'react';
import { Bookmark, BookmarkCheck, Share2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface NewsCardProps {
  id: string;
  title: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentExplanation?: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  isRead: boolean;
  isSaved: boolean;
  onToggleRead: (id: string) => void;
  onToggleSave: (id: string) => void;
  onShare: (id: string) => void;
}

export default function NewsCard({
  id,
  title,
  summary,
  sentiment,
  sentimentExplanation,
  source,
  publishedAt,
  imageUrl,
  isRead,
  isSaved,
  onToggleRead,
  onToggleSave,
  onShare,
}: NewsCardProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'neutral':
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😟';
      case 'neutral':
      default:
        return '😐';
    }
  };

  const formattedDate = format(new Date(publishedAt), 'MMM d, yyyy');

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${isRead ? 'opacity-75' : ''}`}>
      {imageUrl && (
        <Link to={`/article/${id}`} className="block h-48 w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </Link>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">{source} • {formattedDate}</span>
          <div className="flex space-x-2">
            <button
              onClick={() => onToggleRead(id)}
              className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              title={isRead ? 'Mark as unread' : 'Mark as read'}
            >
              {isRead ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button
              onClick={() => onToggleSave(id)}
              className={`${isSaved ? 'text-yellow-500' : 'text-gray-500'} hover:text-yellow-600 dark:hover:text-yellow-400`}
              title={isSaved ? 'Unsave article' : 'Save article'}
            >
              {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
            <button
              onClick={() => onShare(id)}
              className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              title="Share article"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
        <Link to={`/article/${id}`} className="block group">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {title}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">{summary}</p>
        </Link>
        <div className="flex items-center">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(sentiment)}`}
          >
            {getSentimentIcon(sentiment)} {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
          </span>
          {sentimentExplanation && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {sentimentExplanation}
            </span>
          )}
        </div>
        <div className="mt-4">
          <Link 
            to={`/article/${id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Read more →
          </Link>
        </div>
      </div>
    </div>
  );
}