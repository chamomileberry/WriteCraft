import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Custom error class that includes the Response object for enhanced error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public response: Response,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new ApiError(`${res.status}: ${text}`, res, res.status);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: { signal?: AbortSignal }
): Promise<Response> {
  console.log(`[apiRequest] Making request:`, {
    method,
    url,
    hasData: !!data,
    data: data ? JSON.stringify(data).substring(0, 100) : null
  });
  
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    signal: options?.signal,
  });

  console.log(`[apiRequest] Response:`, {
    url,
    status: res.status,
    statusText: res.statusText,
    ok: res.ok,
    headers: Object.fromEntries(res.headers.entries())
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
      onError: (error: Error) => {
        if (error instanceof ApiError && error.status === 401) {
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        }
      },
    },
  },
});
