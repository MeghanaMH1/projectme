import React from 'react';
import { useAuthStore } from '../store/nhostAuthStore';
import { useQuery, useMutation } from '@apollo/client';
import { GET_NEWS_ARTICLES, MARK_ARTICLE_AS_READ, TOGGLE_SAVE_ARTICLE } from '../lib/graphql/operations';
import NewsCard from '../components/NewsCard';
import NewsFilters from '../components/NewsFilters';
import { Newspaper, AlertCircle, PenSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sampleArticles } from '../util/sampleArticles';

interface Article {
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
}

// Generate a device ID or get existing one
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

export default function Dashboard() {
  const { user } = useAuthStore();
  const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);
  const [selectedSentiments, setSelectedSentiments] = React.useState<('positive' | 'negative' | 'neutral')[]>([]);
  const [error, setError] = React.useState('');
  const [localArticles, setLocalArticles] = React.useState<Article[]>([]);
  const [hasAddedSampleArticles, setHasAddedSampleArticles] = React.useState(false);

  // Load articles from localStorage with device-specific key
  React.useEffect(() => {
    const userArticlesKey = getUserArticlesKey();
    const storedArticles = JSON.parse(localStorage.getItem(userArticlesKey) || '[]');
    
    // If no articles exist and we haven't added sample articles yet, add them to localStorage
    if (storedArticles.length === 0 && !hasAddedSampleArticles) {
      const timestamp = Date.now();
      const formattedArticles = sampleArticles.map((article, index) => ({
        id: `local-${timestamp}-${index}`,
        title: article.title,
        content: article.content,
        source: article.source,
        author: article.author,
        image_url: article.imageUrl,
        published_at: new Date().toISOString(),
        url: window.location.origin + `/article/local-${timestamp}-${index}`,
        processedArticle: {
          id: `processed-local-${timestamp}-${index}`,
          summary: article.content.substring(0, 150) + '...',
          sentiment: 'neutral',
          sentiment_explanation: 'Sentiment analysis not available for pre-loaded articles'
        },
        userArticleInteractions: [
          {
            is_read: false,
            is_saved: false
          }
        ]
      }));
      
      localStorage.setItem(userArticlesKey, JSON.stringify(formattedArticles));
      setHasAddedSampleArticles(true);
      
      // Update our local state with the formatted articles
      const formattedLocalArticles = formattedArticles.map((article: any) => ({
        id: article.id,
        title: article.title,
        summary: article.processedArticle?.summary || article.content.substring(0, 150) + '...',
        sentiment: article.processedArticle?.sentiment || 'neutral',
        sentimentExplanation: article.processedArticle?.sentiment_explanation || '',
        source: article.source,
        publishedAt: article.published_at,
        imageUrl: article.image_url,
        isRead: article.userArticleInteractions?.[0]?.is_read || false,
        isSaved: article.userArticleInteractions?.[0]?.is_saved || false,
      }));
      setLocalArticles(formattedLocalArticles);
    } else if (storedArticles.length > 0) {
      // If articles exist, format and display them
      const formattedLocalArticles = storedArticles.map((article: any) => ({
        id: article.id,
        title: article.title,
        summary: article.processedArticle?.summary || article.content.substring(0, 150) + '...',
        sentiment: article.processedArticle?.sentiment || 'neutral',
        sentimentExplanation: article.processedArticle?.sentiment_explanation || '',
        source: article.source,
        publishedAt: article.published_at,
        imageUrl: article.image_url,
        isRead: article.userArticleInteractions?.[0]?.is_read || false,
        isSaved: article.userArticleInteractions?.[0]?.is_saved || false,
      }));
      setLocalArticles(formattedLocalArticles);
    }
  }, [hasAddedSampleArticles]);

  // Get news articles from backend
  const { data, loading } = useQuery(GET_NEWS_ARTICLES, {
    variables: { userId: user?.id, limit: 50 },
    skip: !user?.id,
  });

  // Mutations for article interactions
  const [markAsRead] = useMutation(MARK_ARTICLE_AS_READ);
  const [toggleSave] = useMutation(TOGGLE_SAVE_ARTICLE);

  const handleToggleRead = async (articleId: string) => {
    if (!user) return;

    // Handle local articles
    if (articleId.startsWith('local-')) {
      const userArticlesKey = getUserArticlesKey();
      const userArticles = JSON.parse(localStorage.getItem(userArticlesKey) || '[]');
      const article = userArticles.find((a: any) => a.id === articleId);
      if (!article) return;

      const isCurrentlyRead = article.userArticleInteractions?.[0]?.is_read || false;
      
      const updatedArticles = userArticles.map((a: any) => {
        if (a.id === articleId) {
          return {
            ...a,
            userArticleInteractions: [
              { 
                ...a.userArticleInteractions?.[0] || {},
                is_read: !isCurrentlyRead 
              }
            ]
          };
        }
        return a;
      });

      localStorage.setItem(userArticlesKey, JSON.stringify(updatedArticles));
      
      // Update local state
      setLocalArticles(prev => 
        prev.map(a => a.id === articleId ? {...a, isRead: !isCurrentlyRead} : a)
      );
      return;
    }

    // Handle backend articles
    try {
      await markAsRead({
        variables: {
          userId: user.id,
          articleId,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to mark article as read');
    }
  };

  const handleToggleSave = async (articleId: string) => {
    if (!user) return;

    // Handle local articles
    if (articleId.startsWith('local-')) {
      const userArticlesKey = getUserArticlesKey();
      const userArticles = JSON.parse(localStorage.getItem(userArticlesKey) || '[]');
      const article = userArticles.find((a: any) => a.id === articleId);
      if (!article) return;

      const isCurrentlySaved = article.userArticleInteractions?.[0]?.is_saved || false;
      
      const updatedArticles = userArticles.map((a: any) => {
        if (a.id === articleId) {
          return {
            ...a,
            userArticleInteractions: [
              { 
                ...a.userArticleInteractions?.[0] || {},
                is_saved: !isCurrentlySaved 
              }
            ]
          };
        }
        return a;
      });

      localStorage.setItem(userArticlesKey, JSON.stringify(updatedArticles));
      
      // Update local state
      setLocalArticles(prev => 
        prev.map(a => a.id === articleId ? {...a, isSaved: !isCurrentlySaved} : a)
      );
      return;
    }

    // For backend articles
    const backendArticle = backendArticles.find(a => a.id === articleId);
    if (!backendArticle) return;

    try {
      await toggleSave({
        variables: {
          userId: user.id,
          articleId,
          isSaved: !backendArticle.isSaved,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save/unsave article');
    }
  };

  const handleShare = (articleId: string) => {
    // For local articles
    if (articleId.startsWith('local-')) {
      const article = localArticles.find(a => a.id === articleId);
      if (article) {
        const shareUrl = window.location.origin + `/article/${articleId}`;
        navigator.clipboard.writeText(shareUrl)
          .then(() => {
            alert('Article link copied to clipboard!');
          })
          .catch(() => {
            setError('Failed to copy article link');
          });
      }
      return;
    }
    
    // For backend articles
    const article = backendArticles.find(a => a.id === articleId);
    if (article) {
      const shareUrl = data?.newsArticles.find((a: any) => a.id === articleId)?.url || 
                       window.location.origin + `/article/${articleId}`;
      
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          alert('Article link copied to clipboard!');
        })
        .catch(() => {
          setError('Failed to copy article link');
        });
    }
  };

  const handleResetFilters = () => {
    setSelectedTopics([]);
    setSelectedSentiments([]);
  };

  // Process articles from GraphQL response
  const backendArticles: Article[] = React.useMemo(() => {
    if (!data?.newsArticles) return [];

    return data.newsArticles.map((article: any) => {
      const interaction = article.userArticleInteractions[0] || { is_read: false, is_saved: false };
      const processed = article.processedArticle || { summary: '', sentiment: 'neutral', sentiment_explanation: '' };

      return {
        id: article.id,
        title: article.title,
        summary: processed.summary || article.title,
        sentiment: processed.sentiment || 'neutral',
        sentimentExplanation: processed.sentiment_explanation || '',
        source: article.source || 'Unknown',
        publishedAt: article.published_at || new Date().toISOString(),
        imageUrl: article.image_url || '',
        isRead: interaction.is_read || false,
        isSaved: interaction.is_saved || false,
      };
    });
  }, [data]);

  // Combine backend and local articles
  const articles = React.useMemo(() => {
    // Sort by date, newest first
    return [...backendArticles, ...localArticles].sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [backendArticles, localArticles]);

  // Filter articles based on selected topics and sentiments
  const filteredArticles = React.useMemo(() => {
    return articles.filter(article => {
      const matchesSentiment = selectedSentiments.length === 0 || selectedSentiments.includes(article.sentiment);
      // For topics, we would need to have topics in the article data
      // This is a placeholder for topic filtering
      const matchesTopics = selectedTopics.length === 0; // || selectedTopics.includes(article.topic);
      return matchesSentiment && matchesTopics;
    });
  }, [articles, selectedSentiments, selectedTopics]);

  // Available topics (this would ideally come from the backend)
  const availableTopics = ['Technology', 'Health', 'Science', 'Business', 'Politics', 'Entertainment', 'Sports'];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <Newspaper className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your News Digest
            </h1>
          </div>
          <Link
            to="/create-article"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PenSquare className="h-4 w-4 mr-2" /> Write Article
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        <NewsFilters
          selectedTopics={selectedTopics}
          availableTopics={availableTopics}
          selectedSentiments={selectedSentiments}
          onTopicChange={setSelectedTopics}
          onSentimentChange={setSelectedSentiments}
          onResetFilters={handleResetFilters}
        />

        {loading && localArticles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Loading news articles...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-8 flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No articles found matching your filters.</p>
            <div className="mt-4">
              <Link
                to="/create-article"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PenSquare className="h-4 w-4 mr-2" /> Add Your First Article
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map(article => (
              <NewsCard
                key={article.id}
                id={article.id}
                title={article.title}
                summary={article.summary}
                sentiment={article.sentiment}
                sentimentExplanation={article.sentimentExplanation}
                source={article.source}
                publishedAt={article.publishedAt}
                imageUrl={article.imageUrl}
                isRead={article.isRead}
                isSaved={article.isSaved}
                onToggleRead={handleToggleRead}
                onToggleSave={handleToggleSave}
                onShare={handleShare}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}