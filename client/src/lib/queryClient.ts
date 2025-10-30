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

// CSRF token cache with timestamp for short-lived caching
let csrfTokenCache: { token: string; timestamp: number } | null = null;
const CSRF_CACHE_DURATION = 5000; // 5 seconds cache

async function getCsrfToken(): Promise<string> {
  // Return cached token if still valid
  if (csrfTokenCache && Date.now() - csrfTokenCache.timestamp < CSRF_CACHE_DURATION) {
    return csrfTokenCache.token;
  }

  try {
    const res = await fetch('/api/auth/csrf-token', {
      credentials: 'include',
    });
    
    if (!res.ok) {
      // If unauthorized, user might not be logged in yet - return empty string
      if (res.status === 401) {
        return '';
      }
      console.warn('[CSRF] Failed to fetch CSRF token:', res.status);
      return '';
    }

    const data = await res.json();
    const token = data.csrfToken || ''; // Note: endpoint returns 'csrfToken', not 'token'
    
    // Cache the token
    csrfTokenCache = { token, timestamp: Date.now() };
    
    return token;
  } catch (error) {
    console.warn('[CSRF] Error fetching CSRF token:', error);
    return '';
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

  // Build headers
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }

  // Include CSRF token for state-changing requests
  if (method !== 'GET' && method !== 'HEAD') {
    const token = await getCsrfToken();
    if (token) {
      headers["x-csrf-token"] = token;
    }
  }
  
  const res = await fetch(url, {
    method,
    headers,
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

  // If CSRF token is invalid, clear cache and retry once
  if (res.status === 403 && (await res.clone().text()).includes('CSRF')) {
    console.log('[apiRequest] CSRF token invalid, retrying...');
    csrfTokenCache = null; // Clear the cache
    
    const token = await getCsrfToken();
    if (token) {
      headers["x-csrf-token"] = token;
    }

    const retryRes = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: options?.signal,
    });

    await throwIfResNotOk(retryRes);
    return retryRes;
  }
  
  // Also handle 500 errors with CSRF token missing message
  if (res.status === 500 && (await res.clone().text()).includes('CSRF token missing')) {
    console.log('[apiRequest] CSRF token missing (500), retrying...');
    csrfTokenCache = null; // Clear the cache
    
    const token = await getCsrfToken();
    if (token) {
      headers["x-csrf-token"] = token;
    }

    const retryRes = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: options?.signal,
    });

    await throwIfResNotOk(retryRes);
    return retryRes;
  }

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
