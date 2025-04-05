import React from 'react';
import { useAuthStore } from '../store/nhostAuthStore';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SAVED_ARTICLES, TOGGLE_SAVE_ARTICLE, MARK_ARTICLE_AS_READ } from '../lib/graphql/operations';
import NewsCard from '../components/NewsCard';
import { Bookmark, AlertCircle } from 'lucide-react';

interface ProcessedArticle {
  id: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_explanation: string;
}

interface NewsArticle {
  id: string;
  title: string;
  source: string;
  published_at: string;
  url: string;
  image_url?: string;
  processedArticle: ProcessedArticle;
}

interface UserArticleInteraction {
  article_id: string;
  newsArticle: NewsArticle;
}

export default function SavedArticles() {
  const { user } = useAuthStore();
  const [error, setError] = React.useState('');

  // Get saved articles
  const { data, loading, refetch } = useQuery(GET_SAVED_ARTICLES, {
    variables: { userId: user?.id },
    skip: !user?.id,
    onError: (error) => {
      setError(error.message || 'Failed to fetch saved articles');
    }
  });

  // Mutations for article interactions
  const [toggleSave] = useMutation(TOGGLE_SAVE_ARTICLE);
  const [markAsRead] = useMutation(MARK_ARTICLE_AS_READ);

  const handleToggleSave = async (articleId: string) => {
    if (!user) return;

    try {
      await toggleSave({
        variables: {
          userId: user.id,
          articleId,
          isSaved: false, // We're unsaving since this is the saved articles page
        },
      });
      refetch(); // Refresh the list after unsaving
    } catch (err: any) {
      setError(err.message || 'Failed to unsave article');
    }
  };

  const handleToggleRead = async (articleId: string) => {
    if (!user) return;

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

  const handleShare = (articleId: string) => {
    // Implement sharing functionality
    try {
      const article = data?.userArticleInteractions?.find(
        (interaction: UserArticleInteraction) => interaction.newsArticle?.id === articleId
      )?.newsArticle;
      
      if (article && article.url) {
        navigator.clipboard.writeText(article.url)
          .then(() => {
            alert('Article link copied to clipboard!');
          })
          .catch(() => {
            setError('Failed to copy article link');
          });
      } else {
        setError('Article URL not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to share article');
    }
  };

  // Process and validate saved articles data
  const savedArticles = React.useMemo(() => {
    if (!data?.userArticleInteractions || !Array.isArray(data.userArticleInteractions)) {
      return [];
    }
    
    return data.userArticleInteractions.filter(
      (interaction: UserArticleInteraction) => interaction && interaction.newsArticle
    );
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
            <Bookmark className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Saved Articles
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Loading saved articles...</p>
          </div>
        ) : savedArticles.length === 0 ? (
          <div className="text-center py-8 flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">You haven't saved any articles yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedArticles.map((interaction: UserArticleInteraction) => {
              const article = interaction.newsArticle;
              const processed = article?.processedArticle || { summary: '', sentiment: 'neutral', sentiment_explanation: '' };
              
              return (
                <NewsCard
                  key={article.id}
                  id={article.id}
                  title={article.title || 'Untitled Article'}
                  summary={processed.summary || 'No summary available'}
                  sentiment={(processed.sentiment as 'positive' | 'negative' | 'neutral') || 'neutral'}
                  sentimentExplanation={processed.sentiment_explanation || ''}
                  source={article.source || 'Unknown Source'}
                  publishedAt={article.published_at || new Date().toISOString()}
                  imageUrl={article.image_url}
                  isRead={true} // Saved articles are considered read
                  isSaved={true}
                  onToggleRead={() => handleToggleRead(article.id)}
                  onToggleSave={() => handleToggleSave(article.id)}
                  onShare={() => handleShare(article.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}