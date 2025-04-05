import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/nhostAuthStore';
import { ArrowLeft, Send, HelpCircle, Copy } from 'lucide-react';
import { sampleArticles } from '../util/sampleArticles';

export default function CreateArticle() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = React.useState({
    title: '',
    content: '',
    source: '',
    author: '',
    imageUrl: '',
  });
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [showSampleArticles, setShowSampleArticles] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const applyArticleTemplate = (article: typeof sampleArticles[0]) => {
    setFormData({
      title: article.title,
      content: article.content,
      source: article.source,
      author: article.author,
      imageUrl: article.imageUrl,
    });
    setShowSampleArticles(false);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (!user) {
      setError('You must be logged in to post an article');
      setLoading(false);
      return;
    }

    if (!formData.title || !formData.content || !formData.source) {
      setError('Title, content, and source are required');
      setLoading(false);
      return;
    }

    try {
      // Create a new article with a unique ID
      const articleId = `local-${Date.now()}`;
      const article = {
        id: articleId,
        title: formData.title,
        content: formData.content,
        source: formData.source,
        author: formData.author || user.email,
        image_url: formData.imageUrl || null,
        published_at: new Date().toISOString(),
        url: window.location.origin + `/article/${articleId}`,
        processedArticle: {
          id: `processed-${articleId}`,
          summary: formData.content.substring(0, 150) + '...',
          sentiment: 'neutral',
          sentiment_explanation: 'Sentiment analysis not available for user-created articles'
        },
        userArticleInteractions: [
          {
            is_read: true,
            is_saved: false
          }
        ]
      };

      // Get existing articles from localStorage or create empty array
      const existingArticles = JSON.parse(localStorage.getItem('userArticles') || '[]');
      
      // Add new article to the beginning of the array
      existingArticles.unshift(article);
      
      // Save back to localStorage
      localStorage.setItem('userArticles', JSON.stringify(existingArticles));

      setSuccess(true);
      setFormData({
        title: '',
        content: '',
        source: '',
        author: '',
        imageUrl: '',
      });
      
      // Navigate to the article detail page after 2 seconds
      setTimeout(() => {
        navigate(`/article/${articleId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <button
        onClick={goBack}
        className="inline-flex items-center mb-6 text-blue-600 dark:text-blue-400 hover:underline"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to articles
      </button>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Submit Your Article</h1>
            <button
              onClick={() => setShowSampleArticles(!showSampleArticles)}
              className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <HelpCircle className="h-4 w-4 mr-1" /> 
              {showSampleArticles ? 'Hide Examples' : 'Show Examples'}
            </button>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900 p-4 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-50 dark:bg-green-900 p-4 rounded-md">
              <p className="text-sm text-green-700 dark:text-green-200">
                Article submitted successfully! Redirecting you to the article...
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                rows={12}
                value={formData.content}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                You can use basic HTML tags for formatting
              </p>
            </div>
            
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Source *
              </label>
              <input
                type="text"
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                required
                placeholder="e.g., Your Blog Name, Publication, etc."
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Author
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : (
                  <>
                    <Send className="h-4 w-4 mr-2" /> Submit Article
                  </>
                )}
              </button>
            </div>
          </form>
          
          {showSampleArticles && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Example Articles
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Click any of these examples to auto-fill the form with sample articles. You can then submit them to add them to your news feed.
              </p>
              
              <div className="space-y-4">
                {sampleArticles.map((article, index) => (
                  <div 
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
                    onClick={() => applyArticleTemplate(article)}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white">{article.title}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          applyArticleTemplate(article);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        title="Use this article"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {article.source} • {article.author}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 