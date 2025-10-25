import { useEffect, useRef } from 'react';
import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, ApiError } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiMutationConfig<TData = any, TVariables = any> {
  method: HttpMethod;
  endpoint: string | ((variables: TVariables) => string);
  successMessage?: string;
  errorMessage?: string;
  invalidateQueries?: string[] | ((data: TData, variables: TVariables) => string[]);
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  transformPayload?: (variables: TVariables) => any;
  transformResponse?: (response: Response) => Promise<TData>;
  retry?: boolean | number; // Enable retry: true for 3 retries, or specify number
  retryDelay?: number; // Delay between retries in ms (default: 1000)
}

export function useApiMutation<TData = any, TVariables = any>(
  config: ApiMutationConfig<TData, TVariables>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn' | 'onSuccess' | 'onError'>
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<TData, Error, TVariables>({
    retry: config.retry === true ? 3 : (config.retry || false),
    retryDelay: config.retryDelay || 1000,
    mutationFn: async (variables: TVariables) => {
      // Abort previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const endpoint = typeof config.endpoint === 'function'
        ? config.endpoint(variables)
        : config.endpoint;

      const payload = config.transformPayload
        ? config.transformPayload(variables)
        : variables;

      try {
        const response = await apiRequest(config.method, endpoint, payload, { signal });

        if (config.transformResponse) {
          return config.transformResponse(response);
        }

        // Default response handling
        if (response.headers.get('content-type')?.includes('application/json')) {
          return response.json() as Promise<TData>;
        }
        return response as TData;
      } catch (error) {
        // Don't throw AbortError to user
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request cancelled');
        }
        throw error;
      }
    },
    onSuccess: (data: TData, variables: TVariables) => {
      // Show success toast if message provided
      if (config.successMessage) {
        toast({
          title: "Success",
          description: config.successMessage,
        });
      }

      // Invalidate queries
      if (config.invalidateQueries) {
        const queriesToInvalidate = Array.isArray(config.invalidateQueries)
          ? config.invalidateQueries
          : config.invalidateQueries(data, variables);
        
        queriesToInvalidate.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }

      // Execute custom onSuccess callback
      config.onSuccess?.(data, variables);
    },
    onError: (error: Error, variables: TVariables) => {
      // Enhanced error message based on error type
      let errorTitle = "Error";
      let errorDescription = config.errorMessage || "Operation failed. Please try again.";
      
      // Parse API error response for better messages
      if (error instanceof ApiError) {
        // Handle different HTTP status codes
        switch (error.status) {
          case 400:
            errorTitle = "Invalid Request";
            errorDescription = "Please check your input and try again.";
            break;
          case 401:
            errorTitle = "Unauthorized";
            errorDescription = "Please log in to continue.";
            break;
          case 403:
            errorTitle = "Forbidden";
            errorDescription = "You don't have permission to perform this action.";
            break;
          case 404:
            errorTitle = "Not Found";
            errorDescription = "The requested resource could not be found.";
            break;
          case 409:
            errorTitle = "Conflict";
            errorDescription = "This item already exists or conflicts with existing data.";
            break;
          case 422:
            errorTitle = "Validation Error";
            errorDescription = "Please check your input for errors.";
            break;
          case 429:
            errorTitle = "Too Many Requests";
            errorDescription = "Please wait a moment before trying again.";
            break;
          case 500:
            errorTitle = "Server Error";
            errorDescription = "Something went wrong on our end. Please try again later.";
            break;
          case 503:
            errorTitle = "Service Unavailable";
            errorDescription = "The service is temporarily unavailable. Please try again later.";
            break;
        }
      }
      
      // Handle network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        errorTitle = "Network Error";
        errorDescription = "Please check your internet connection and try again.";
      }
      
      // Use custom error message if provided
      if (config.errorMessage) {
        errorDescription = config.errorMessage;
      }
      
      // Show error toast with enhanced messaging
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });

      // Execute custom onError callback
      config.onError?.(error, variables);

      // Log error for debugging with more context
      logger.error('API Mutation Error:', {
        error,
        endpoint: typeof config.endpoint === 'function' ? config.endpoint(variables) : config.endpoint,
        method: config.method,
        variables,
      });
    },
    ...options,
  });

  // Abort on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return mutation;
}

// Convenience hooks for common patterns
export function useCreateMutation<TData = any, TVariables = any>(
  endpoint: string,
  config?: Partial<ApiMutationConfig<TData, TVariables>>
) {
  return useApiMutation({
    method: 'POST',
    endpoint,
    successMessage: "Item created successfully!",
    errorMessage: "Failed to create item. Please try again.",
    ...config,
  });
}

export function useUpdateMutation<TData = any, TVariables = any>(
  endpoint: string | ((variables: TVariables) => string),
  config?: Partial<ApiMutationConfig<TData, TVariables>>
) {
  return useApiMutation({
    method: 'PUT',
    endpoint,
    successMessage: "Item updated successfully!",
    errorMessage: "Failed to update item. Please try again.",
    ...config,
  });
}

export function useDeleteMutation<TVariables = any>(
  endpoint: string | ((variables: TVariables) => string),
  config?: Partial<ApiMutationConfig<any, TVariables>>
) {
  return useApiMutation({
    method: 'DELETE',
    endpoint,
    successMessage: "Item deleted successfully!",
    errorMessage: "Failed to delete item. Please try again.",
    ...config,
  });
}

export function useSaveMutation<TData = any, TVariables = any>(
  endpoint: string = '/api/saved-items',
  config?: Partial<ApiMutationConfig<TData, TVariables>>
) {
  return useApiMutation({
    method: 'POST',
    endpoint,
    successMessage: "Item saved to your collection!",
    errorMessage: "Failed to save item. Please try again.",
    invalidateQueries: ['/api/saved-items'],
    ...config,
  });
}

export function useGenerateMutation<TData = any, TVariables = any>(
  endpoint: string,
  config?: Partial<ApiMutationConfig<TData, TVariables>>
) {
  return useApiMutation({
    method: 'POST',
    endpoint,
    errorMessage: "Failed to generate content. Please try again.",
    ...config,
  });
}