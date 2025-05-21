import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';

// Configuration du client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Désactive le rechargement automatique lors du focus sur la fenêtre
      retry: 1, // Nombre de tentatives en cas d'échec
      staleTime: 5 * 60 * 1000, // Durée pendant laquelle les données sont considérées comme "fraîches" (5 minutes)
      gcTime: 10 * 60 * 1000, // Durée de conservation des données en cache (10 minutes) - anciennement cacheTime
    },
  },
});

// Composant Provider pour React Query
export const ReactQueryProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
};

export { queryClient };
