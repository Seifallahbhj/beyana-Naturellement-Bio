import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useState } from 'react';

// Composant Provider pour React Query
export const ReactQueryProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // Créer une nouvelle instance de QueryClient pour chaque montage du composant
  // Cela évite les problèmes de partage d'état entre les rendus en mode strict
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // Désactive le rechargement automatique lors du focus sur la fenêtre
        retry: 1, // Nombre de tentatives en cas d'échec
        staleTime: 5 * 60 * 1000, // Durée pendant laquelle les données sont considérées comme "fraîches" (5 minutes)
        gcTime: 10 * 60 * 1000, // Durée de conservation des données en cache (10 minutes) - anciennement cacheTime
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools 
        buttonPosition="bottom-left"
        position="bottom"
        initialIsOpen={false}
      />
    </QueryClientProvider>
  );
};

// Note: Nous n'exportons plus directement queryClient pour éviter les problèmes de référence
// Les composants qui ont besoin d'accéder au queryClient devraient utiliser useQueryClient de React Query
