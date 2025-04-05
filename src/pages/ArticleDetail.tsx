import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_ARTICLE_BY_ID } from '../lib/graphql/operations';
import { useAuthStore } from '../store/nhostAuthStore';
import { Bookmark, BookmarkCheck, Share2, ArrowLeft, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

// Reuse the same device ID function from Dashboard
const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

// User articles storage key with device ID
const getUserArticlesKey = () => {
  const deviceId = getDeviceId();
  return `userArticles_${deviceId}`;
};

export default function ArticleDetail() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [error, setError] = React.useState('');
  const [localArticle, setLocalArticle] = React.useState<any>(null);

  // Check localStorage for the article if it starts with "local-"
  React.useEffect(() => {
    if (articleId?.startsWith('local-')) {
      const userArticlesKey = getUserArticlesKey();
      const userArticles = JSON.parse(localStorage.getItem(userArticlesKey) || '[]');
      const article = userArticles.find((a: any) => a.id === articleId);
      setLocalArticle(article || null);
    }
  }, [articleId]);

  // Only query for backend articles if not a local article
  const { data, loading } = useQuery(GET_ARTICLE_BY_ID, {
    variables: { articleId, userId: user?.id },
    skip: !articleId || !user?.id || articleId.startsWith('local-'),
  });

  // Use either backend article or local article
  const article = localArticle || data?.newsArticle;
  const interaction = article?.userArticleInteractions[0];

  // Format date if available
  const formattedDate = article?.published_at 
    ? format(new Date(article.published_at), 'MMMM d, yyyy') 
    : '';

  const handleShare = () => {
    if (article) {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Article link copied to clipboard!');
        })
        .catch(() => {
          setError('Failed to copy article link');
        });
    }
  };

  const handleToggleSave = () => {
    if (!article || !user) return;

    // For local articles, handle saving in localStorage
    if (article.id.startsWith('local-')) {
      const userArticlesKey = getUserArticlesKey();
      const userArticles = JSON.parse(localStorage.getItem(userArticlesKey) || '[]');
      const updatedArticles = userArticles.map((a: any) => {
        if (a.id === article.id) {
          return {
            ...a,
            userArticleInteractions: [
              { 
                ...a.userArticleInteractions[0],
                is_saved: !a.userArticleInteractions[0].is_saved
              }
            ]
          };
        }
        return a;
      });

      localStorage.setItem(userArticlesKey, JSON.stringify(updatedArticles));
      // Force re-render to show updated saved state
      setLocalArticle(updatedArticles.find((a: any) => a.id === article.id));
    }
    // For backend articles, this would call the mutation
  };

  const goBack = () => {
    navigate(-1);
  };

  if (loading && !localArticle) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-10"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Article Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900 p-4 rounded-md">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      <button
        onClick={goBack}
        className="inline-flex items-center mb-6 text-blue-600 dark:text-blue-400 hover:underline"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to articles
      </button>

      <article className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        {article.image_url && (
          <div className="h-64 sm:h-80 w-full overflow-hidden">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {article.source} {formattedDate && `• ${formattedDate}`}
              </span>
              {article.author && (
                <span className="block text-sm text-gray-600 dark:text-gray-400 mt-1">
                  By {article.author}
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleShare}
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                title="Share article"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={handleToggleSave}
                className={`${interaction?.is_saved ? 'text-yellow-500' : 'text-gray-500'} hover:text-yellow-600 dark:hover:text-yellow-400`}
                title={interaction?.is_saved ? 'Unsave article' : 'Save article'}
              >
                {interaction?.is_saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
              </button>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{article.title}</h1>
          
          {article.processedArticle?.summary && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Summary</h2>
              <p className="text-gray-700 dark:text-gray-300">{article.processedArticle.summary}</p>
            </div>
          )}
          
          {article.processedArticle?.sentiment && (
            <div className="mb-6">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                article.processedArticle.sentiment === 'positive' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : article.processedArticle.sentiment === 'negative'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {article.processedArticle.sentiment.charAt(0).toUpperCase() + article.processedArticle.sentiment.slice(1)}
              </span>
              {article.processedArticle.sentiment_explanation && (
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {article.processedArticle.sentiment_explanation}
                </span>
              )}
            </div>
          )}
          
          <div className="prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
        </div>
      </article>
    </div>
  );
} 