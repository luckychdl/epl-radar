"use client";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactNode, useState } from "react";
type Props = { children: ReactNode };

export default function QueryProvider({ children }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            // ✅ 여기서 토스트/로그/공통 처리
            console.log("Query error", query.queryKey, error);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, variables, context, mutation) => {
            // console.log("Mutation error", mutation.options.mutationKey, error);
          },
        }),
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 1000 * 60,
          },
          mutations: { retry: 0 },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
