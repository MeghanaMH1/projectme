import React from 'react';
import { useAuthStore } from '../store/nhostAuthStore';
import { useMutation, useQuery } from '@apollo/client';
import { GET_USER_PREFERENCES, CREATE_USER_PREFERENCES, UPDATE_USER_PREFERENCES } from '../lib/graphql/operations';
import PreferencesForm from '../components/PreferencesForm';
import { Settings } from 'lucide-react';

export default function NewsPreferences() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  // Get user preferences
  const { data, loading: preferencesLoading } = useQuery(GET_USER_PREFERENCES, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });

  const userPreferences = data?.userPreferences[0] || null;

  // Create or update user preferences
  const [createPreferences] = useMutation(CREATE_USER_PREFERENCES);
  const [updatePreferences] = useMutation(UPDATE_USER_PREFERENCES);

  const handleSavePreferences = async (preferences: {
    topics: string[];
    keywords: string[];
    preferredSources: string[];
  }) => {
    if (!user) return;

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (userPreferences) {
        // Update existing preferences
        await updatePreferences({
          variables: {
            id: userPreferences.id,
            topics: preferences.topics,
            keywords: preferences.keywords,
            preferredSources: preferences.preferredSources,
          },
        });
      } else {
        // Create new preferences
        await createPreferences({
          variables: {
            userId: user.id,
            topics: preferences.topics,
            keywords: preferences.keywords,
            preferredSources: preferences.preferredSources,
          },
        });
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
            <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            News Preferences
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900 rounded-md">
            <p className="text-sm text-green-700 dark:text-green-200">
              Preferences saved successfully!
            </p>
          </div>
        )}

        <PreferencesForm
          topics={userPreferences?.topics || []}
          keywords={userPreferences?.keywords || []}
          preferredSources={userPreferences?.preferred_sources || []}
          onSave={handleSavePreferences}
          isLoading={isLoading || preferencesLoading}
        />
      </div>
    </div>
  );
}