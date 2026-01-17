import { isDefinedError } from "@orpc/client";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";

import type { ORPCClientError } from "./orpc";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      invalidateQueries?: QueryKey[];
      successMessage?: string;
      errorMessage?: string;
    };
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error.message ?? "Something went wrong", {
        action: {
          label: "retry",
          onClick: async () => {
            await queryClient.invalidateQueries();
          },
        },
      });
    },
  }),

  mutationCache: new MutationCache({
    onSuccess: (data, _vars, _ctx, mutation) => {
      if (mutation.meta?.successMessage) {
        toast.success(mutation.meta.successMessage);
      }

      if (
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        toast.success(data.message);
      }
    },

    onError: (_error, _vars, _ctx, mutation) => {
      if (mutation.meta?.errorMessage) {
        toast.error(mutation.meta.errorMessage);
        return;
      }

      if (
        isDefinedError<ORPCClientError>(_error) &&
        _error.code === "INPUT_VALIDATION_FAILED"
      ) {
        const { formErrors, fieldErrors } = _error.data;

        const messages = formErrors.length
          ? formErrors
          : Object.values(fieldErrors).flat().filter(Boolean);

        toast.error(
          <ul className="ml-5 list-disc">
            {messages.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>,
        );
        return;
      }

      // @ts-expect-error
      if (_error?.status === 401) {
        return;
      }

      toast.error(_error.message ?? "Mutation failed");
    },

    onSettled: (_data, _error, _vars, _ctx, mutation) => {
      const keys = mutation.meta?.invalidateQueries;

      if (Array.isArray(keys)) {
        keys.forEach((queryKey) => {
          void queryClient.invalidateQueries({ queryKey });
        });
      }
    },
  }),
});
