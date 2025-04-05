import React from 'react';
import { Filter, X } from 'lucide-react';

interface NewsFiltersProps {
  selectedTopics: string[];
  availableTopics: string[];
  selectedSentiments: ('positive' | 'negative' | 'neutral')[];
  onTopicChange: (topics: string[]) => void;
  onSentimentChange: (sentiments: ('positive' | 'negative' | 'neutral')[]) => void;
  onResetFilters: () => void;
}

export default function NewsFilters({
  selectedTopics,
  availableTopics,
  selectedSentiments,
  onTopicChange,
  onSentimentChange,
  onResetFilters,
}: NewsFiltersProps) {
  const handleTopicToggle = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      onTopicChange(selectedTopics.filter((t) => t !== topic));
    } else {
      onTopicChange([...selectedTopics, topic]);
    }
  };

  const handleSentimentToggle = (sentiment: 'positive' | 'negative' | 'neutral') => {
    if (selectedSentiments.includes(sentiment)) {
      onSentimentChange(selectedSentiments.filter((s) => s !== sentiment));
    } else {
      onSentimentChange([...selectedSentiments, sentiment]);
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

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
        </div>
        {(selectedTopics.length > 0 || selectedSentiments.length > 0) && (
          <button
            onClick={onResetFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Reset all
          </button>
        )}
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topics</h4>
        <div className="flex flex-wrap gap-2">
          {availableTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => handleTopicToggle(topic)}
              className={`px-3 py-1 rounded-full text-sm ${selectedTopics.includes(topic) 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sentiment</h4>
        <div className="flex flex-wrap gap-2">
          {(['positive', 'neutral', 'negative'] as const).map((sentiment) => (
            <button
              key={sentiment}
              onClick={() => handleSentimentToggle(sentiment)}
              className={`px-3 py-1 rounded-full text-sm flex items-center ${selectedSentiments.includes(sentiment) 
                ? getSentimentColor(sentiment) 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              {getSentimentIcon(sentiment)} {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getSentimentColor(sentiment: string) {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'negative':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'neutral':
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }
}