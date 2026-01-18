import { isDefinedError } from "@orpc/client";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { Alert } from "react-native";

import type { ORPCClientError } from "./orpc";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      invalidateQueries?: QueryKey[];
      successMessage?: string;
      errorMessage?: string;
      /** If true, shows success message as alert */
      showSuccessAlert?: boolean;
    };
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error("[QueryCache Error]", error);
      // For query errors, we typically don't show alerts
      // The UI should handle loading/error states
    },
  }),

  mutationCache: new MutationCache({
    onSuccess: (data, _vars, _ctx, mutation) => {
      // Show success message if configured
      if (mutation.meta?.successMessage && mutation.meta?.showSuccessAlert) {
        Alert.alert("Success", mutation.meta.successMessage);
      }

      // Auto-show message from response data
      if (
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof data.message === "string" &&
        mutation.meta?.showSuccessAlert
      ) {
        Alert.alert("Success", data.message);
      }
    },

    onError: (_error, _vars, _ctx, mutation) => {
      // Custom error message from meta
      if (mutation.meta?.errorMessage) {
        Alert.alert("Error", mutation.meta.errorMessage);
        return;
      }

      // Handle oRPC validation errors
      if (
        isDefinedError<ORPCClientError>(_error) &&
        _error.code === "INPUT_VALIDATION_FAILED"
      ) {
        const { formErrors, fieldErrors } = _error.data;

        const messages = formErrors.length
          ? formErrors
          : Object.values(fieldErrors).flat().filter(Boolean);

        Alert.alert("Validation Error", messages.join("\n"));
        return;
      }

      // Skip 401 errors (handled by auth flow)
      // @ts-expect-error - status may exist on error
      if (_error?.status === 401) {
        return;
      }

      // Generic error
      Alert.alert("Error", _error.message ?? "Something went wrong");
    },

    onSettled: (_data, _error, _vars, _ctx, mutation) => {
      // Auto-invalidate queries after mutation
      const keys = mutation.meta?.invalidateQueries;

      if (Array.isArray(keys)) {
        keys.forEach((queryKey) => {
          void queryClient.invalidateQueries({ queryKey });
        });
      }
    },
  }),

  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});
