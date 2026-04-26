"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: process.env.NODE_ENV === "production",
          },
        },
      })
  );

  return (
    <NuqsAdapter>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
}
