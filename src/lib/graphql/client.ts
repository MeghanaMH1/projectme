import { NhostApolloProvider } from '@nhost/react-apollo';
import { NhostProvider } from '@nhost/react';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { nhost } from '../nhost';

// Create the HTTP link for the Apollo Client
const httpLink = createHttpLink({
  uri: `https://${import.meta.env.VITE_NHOST_REGION}.graphql.${import.meta.env.VITE_NHOST_SUBDOMAIN}.nhost.run/v1`,
});

// Add the auth token to the headers
const authLink = setContext(async (_, { headers }) => {
  // Get the authentication token from Nhost
  const token = nhost.auth.getAccessToken();
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create the Apollo Client
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// Export the providers for use in the app
export { NhostApolloProvider, NhostProvider };