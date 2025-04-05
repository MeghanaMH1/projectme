import React from 'react';
import { Settings, Plus, X } from 'lucide-react';

interface PreferencesFormProps {
  topics: string[];
  keywords: string[];
  preferredSources: string[];
  onSave: (preferences: {
    topics: string[];
    keywords: string[];
    preferredSources: string[];
  }) => void;
  isLoading: boolean;
}

export default function PreferencesForm({
  topics: initialTopics,
  keywords: initialKeywords,
  preferredSources: initialPreferredSources,
  onSave,
  isLoading,
}: PreferencesFormProps) {
  const [topics, setTopics] = React.useState<string[]>(initialTopics);
  const [keywords, setKeywords] = React.useState<string[]>(initialKeywords);
  const [preferredSources, setPreferredSources] = React.useState<string[]>(initialPreferredSources);
  
  const [newTopic, setNewTopic] = React.useState('');
  const [newKeyword, setNewKeyword] = React.useState('');
  const [newSource, setNewSource] = React.useState('');

  // Common topics for suggestions
  const topicSuggestions = [
    'Technology', 'Business', 'Politics', 'Health', 'Science', 
    'Sports', 'Entertainment', 'World', 'Environment', 'Education'
  ];

  // Common news sources for suggestions
  const sourceSuggestions = [
    'BBC', 'CNN', 'Reuters', 'Associated Press', 'The Guardian',
    'The New York Times', 'The Washington Post', 'Al Jazeera', 'Bloomberg', 'CNBC'
  ];

  const handleAddTopic = () => {
    if (newTopic && !topics.includes(newTopic)) {
      setTopics([...topics, newTopic]);
      setNewTopic('');
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword]);
      setNewKeyword('');
    }
  };

  const handleAddSource = () => {
    if (newSource && !preferredSources.includes(newSource)) {
      setPreferredSources([...preferredSources, newSource]);
      setNewSource('');
    }
  };

  const handleRemoveTopic = (topic: string) => {
    setTopics(topics.filter((t) => t !== topic));
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleRemoveSource = (source: string) => {
    setPreferredSources(preferredSources.filter((s) => s !== source));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ topics, keywords, preferredSources });
  };

  const handleSuggestionClick = (suggestion: string, type: 'topic' | 'source') => {
    if (type === 'topic' && !topics.includes(suggestion)) {
      setTopics([...topics, suggestion]);
    } else if (type === 'source' && !preferredSources.includes(suggestion)) {
      setPreferredSources([...preferredSources, suggestion]);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
          <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">News Preferences</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topics Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Topics of Interest
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {topics.map((topic) => (
              <div 
                key={topic} 
                className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {topic}
                <button 
                  type="button" 
                  onClick={() => handleRemoveTopic(topic)}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Add a topic"
              className="flex-grow rounded-l-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={handleAddTopic}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r-md text-sm flex items-center"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Suggestions:</p>
            <div className="flex flex-wrap gap-1">
              {topicSuggestions
                .filter(suggestion => !topics.includes(suggestion))
                .slice(0, 5)
                .map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion, 'topic')}
                    className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300 px-2 py-1 rounded"
                  >
                    {suggestion}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Keywords Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Keywords
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {keywords.map((keyword) => (
              <div 
                key={keyword} 
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {keyword}
                <button 
                  type="button" 
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Add a keyword"
              className="flex-grow rounded-l-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={handleAddKeyword}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-r-md text-sm flex items-center"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Preferred Sources Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preferred Sources
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {preferredSources.map((source) => (
              <div 
                key={source} 
                className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {source}
                <button 
                  type="button" 
                  onClick={() => handleRemoveSource(source)}
                  className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              placeholder="Add a source"
              className="flex-grow rounded-l-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={handleAddSource}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-r-md text-sm flex items-center"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Suggestions:</p>
            <div className="flex flex-wrap gap-1">
              {sourceSuggestions
                .filter(suggestion => !preferredSources.includes(suggestion))
                .slice(0, 5)
                .map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion, 'source')}
                    className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300 px-2 py-1 rounded"
                  >
                    {suggestion}
                  </button>
                ))}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}