import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Global QueryClient configuration.
 * Centralized TanStack Query defaults for the entire application.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests twice before giving up
      retry: 2,
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Don't refetch when window regains focus (reduces API calls)
      refetchOnWindowFocus: false,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      // Show error toasts by default (can be overridden per-mutation)
      retry: 0,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Application-wide Query Provider.
 * Wraps the app with TanStack Query context.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
