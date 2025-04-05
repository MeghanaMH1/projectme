import React from 'react';
import { useAuthStore } from '../store/nhostAuthStore';
import { useQuery, useMutation } from '@apollo/client';
import { GET_NEWS_ARTICLES, MARK_ARTICLE_AS_READ, TOGGLE_SAVE_ARTICLE } from '../lib/graphql/operations';
import NewsCard from '../components/NewsCard';
import NewsFilters from '../components/NewsFilters';
import { Newspaper, AlertCircle } from 'lucide-react';

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

export default function Dashboard() {
  const { user } = useAuthStore();
  const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);
  const [selectedSentiments, setSelectedSentiments] = React.useState<('positive' | 'negative' | 'neutral')[]>([]);
  const [error, setError] = React.useState('');

  // Get news articles
  const { data, loading } = useQuery(GET_NEWS_ARTICLES, {
    variables: { userId: user?.id, limit: 50 },
    skip: !user?.id,
  });

  // Mutations for article interactions
  const [markAsRead] = useMutation(MARK_ARTICLE_AS_READ);
  const [toggleSave] = useMutation(TOGGLE_SAVE_ARTICLE);

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

  const handleToggleSave = async (articleId: string) => {
    if (!user) return;

    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    try {
      await toggleSave({
        variables: {
          userId: user.id,
          articleId,
          isSaved: !article.isSaved,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save/unsave article');
    }
  };

  const handleShare = (articleId: string) => {
    // Implement sharing functionality
    const article = data?.newsArticles.find(
      (a: any) => a.id === articleId
    );
    
    if (article) {
      navigator.clipboard.writeText(article.url)
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
  const articles: Article[] = React.useMemo(() => {
    if (!data?.newsArticles) return [
      {
        id: 'sample-1',
        title: 'The Future of AI in Healthcare',
        summary: 'Artificial intelligence is revolutionizing healthcare with applications in diagnostics, drug discovery, and personalized medicine.',
        sentiment: 'positive',
        sentimentExplanation: 'The article highlights positive advancements in healthcare technology.',
        source: 'Tech Insights',
        publishedAt: '2024-05-15',
        imageUrl: '',
        isRead: false,
        isSaved: false
      },
      {
        id: 'sample-2',
        title: 'Quantum Computing Breakthrough',
        summary: 'Researchers have achieved quantum supremacy with a new 128-qubit processor, opening doors to previously impossible computations.',
        sentiment: 'positive',
        sentimentExplanation: 'The breakthrough represents significant progress in quantum computing.',
        source: 'Science Daily',
        publishedAt: '2024-05-10',
        imageUrl: '',
        isRead: false,
        isSaved: false
      }
    ];

    return data.newsArticles.map((article: any) => {
      const interaction = article.userArticleInteractions[0] || { is_read: false, is_saved: false };
      const processed = article.processedArticle || { summary: '', sentiment: 'neutral', sentiment_explanation: '' };

      return {
        id: article.id,
        title: article.title,
        summary: processed.summary,
        sentiment: processed.sentiment,
        sentimentExplanation: processed.sentiment_explanation,
        source: article.source,
        publishedAt: article.published_at,
        imageUrl: article.image_url,
        isRead: interaction.is_read,
        isSaved: interaction.is_saved,
      };
    });
  }, [data]);

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
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
            <Newspaper className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your News Digest
          </h1>
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

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Loading news articles...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-8 flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No articles found matching your filters.</p>
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