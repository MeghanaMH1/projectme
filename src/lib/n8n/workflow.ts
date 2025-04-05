import axios from 'axios';
import { nhost } from '../nhost';

interface NewsArticle {
  title: string;
  content: string;
  source: string;
  author?: string;
  publishedAt: string;
  url: string;
  imageUrl?: string;
}

interface ProcessedArticle {
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentExplanation: string;
}

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || '';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

if (!N8N_WEBHOOK_URL || !OPENROUTER_API_KEY) {
  throw new Error('N8N Webhook URL and OpenRouter API Key are required');
}

// Function to trigger the n8n workflow for news fetching
export const fetchNewsArticles = async (topics: string[], keywords: string[]) => {
  try {
    const response = await axios.post(N8N_WEBHOOK_URL, {
      topics,
      keywords,
    });

    return response.data;
  } catch (error) {
    console.error('Error triggering n8n workflow:', error);
    throw new Error('Failed to fetch news articles');
  }
};

// Function to process articles with OpenRouter AI
export const processArticleWithAI = async (article: NewsArticle): Promise<ProcessedArticle> => {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-2',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that analyzes news articles to provide summaries and sentiment analysis.'
          },
          {
            role: 'user',
            content: `Please analyze this news article and provide:
              1. A concise summary (max 3 sentences)
              2. Sentiment (positive, negative, or neutral)
              3. Brief explanation of the sentiment

              Article: ${article.title}\n${article.content}`
          }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    const [summary, sentiment, explanation] = parseAIResponse(aiResponse);

    return {
      summary,
      sentiment: sentiment as 'positive' | 'negative' | 'neutral',
      sentimentExplanation: explanation,
    };
  } catch (error) {
    console.error('Error processing article with AI:', error);
    throw new Error('Failed to process article with AI');
  }
};

// Helper function to parse AI response
const parseAIResponse = (response: string): [string, string, string] => {
  // Simple parsing logic - can be enhanced based on actual AI response format
  const lines = response.split('\n').filter(line => line.trim());
  
  return [
    lines[0] || '', // Summary
    lines[1]?.toLowerCase().includes('positive') ? 'positive' :
      lines[1]?.toLowerCase().includes('negative') ? 'negative' : 'neutral', // Sentiment
    lines[2] || '', // Explanation
  ];
};