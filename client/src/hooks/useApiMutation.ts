import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
}

export function useApiMutation<TData = any, TVariables = any>(
  config: ApiMutationConfig<TData, TVariables>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn' | 'onSuccess' | 'onError'>
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const endpoint = typeof config.endpoint === 'function' 
        ? config.endpoint(variables) 
        : config.endpoint;
      
      const payload = config.transformPayload 
        ? config.transformPayload(variables)
        : variables;

      const response = await apiRequest(config.method, endpoint, payload);
      
      if (config.transformResponse) {
        return config.transformResponse(response);
      }

      // Default response handling
      if (response.headers.get('content-type')?.includes('application/json')) {
        return response.json() as Promise<TData>;
      }
      return response as TData;
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
      // Show error toast
      const errorMessage = config.errorMessage || "Operation failed. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Execute custom onError callback
      config.onError?.(error, variables);
      
      // Log error for debugging
      console.error('API Mutation Error:', error);
    },
    ...options,
  });

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