import { gql } from '@apollo/client';

// User Preferences Queries and Mutations
export const GET_USER_PREFERENCES = gql`
  query GetUserPreferences($userId: ID!) {
    userPreferences(where: { user_id: { _eq: $userId } }) {
      id
      topics
      keywords
      preferred_sources
    }
  }
`;

export const CREATE_USER_PREFERENCES = gql`
  mutation CreateUserPreferences(
    $userId: ID!, 
    $topics: [String!]!, 
    $keywords: [String!], 
    $preferredSources: [String!]
  ) {
    insertUserPreferences(
      object: {
        user_id: $userId, 
        topics: $topics, 
        keywords: $keywords, 
        preferred_sources: $preferredSources
      }
    ) {
      id
    }
  }
`;

export const UPDATE_USER_PREFERENCES = gql`
  mutation UpdateUserPreferences(
    $id: ID!, 
    $topics: [String!]!, 
    $keywords: [String!], 
    $preferredSources: [String!]
  ) {
    updateUserPreferences(
      pk_columns: { id: $id },
      _set: {
        topics: $topics, 
        keywords: $keywords, 
        preferred_sources: $preferredSources
      }
    ) {
      id
    }
  }
`;

// News Articles Queries
export const GET_NEWS_ARTICLES = gql`
  query GetNewsArticles($userId: ID!, $limit: Int!) {
    newsArticles(limit: $limit, order_by: { published_at: desc }) {
      id
      title
      source
      published_at
      url
      image_url
      processedArticle {
        id
        summary
        sentiment
        sentiment_explanation
      }
      userArticleInteractions(where: { user_id: { _eq: $userId } }) {
        is_read
        is_saved
      }
    }
  }
`;

export const GET_SAVED_ARTICLES = gql`
  query GetSavedArticles($userId: ID!) {
    userArticleInteractions(
      where: { user_id: { _eq: $userId }, is_saved: { _eq: true } }
    ) {
      article_id
      newsArticle {
        id
        title
        source
        published_at
        url
        image_url
        processedArticle {
          id
          summary
          sentiment
          sentiment_explanation
        }
      }
    }
  }
`;

// User Article Interactions Mutations
export const MARK_ARTICLE_AS_READ = gql`
  mutation MarkArticleAsRead($userId: ID!, $articleId: ID!) {
    insertUserArticleInteraction(
      object: {
        user_id: $userId,
        article_id: $articleId,
        is_read: true,
        is_saved: false
      },
      on_conflict: {
        constraint: user_article_interaction_pkey,
        update_columns: [is_read]
      }
    ) {
      id
    }
  }
`;

export const TOGGLE_SAVE_ARTICLE = gql`
  mutation ToggleSaveArticle($userId: ID!, $articleId: ID!, $isSaved: Boolean!) {
    insertUserArticleInteraction(
      object: {
        user_id: $userId,
        article_id: $articleId,
        is_saved: $isSaved,
        is_read: true
      },
      on_conflict: {
        constraint: user_article_interaction_pkey,
        update_columns: [is_saved]
      }
    ) {
      id
      is_saved
    }
  }
`;