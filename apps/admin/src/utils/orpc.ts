import type { AppRouterClient } from "server/src/orpc/routers";

import { env } from "@foodnest/env/web";
import {
  createORPCClient,
  type InferClientErrorUnion,
  type InferClientOutputs,
} from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

export type ORPCClientError = InferClientErrorUnion<AppRouterClient>;
export type ORPCClientOutputs = InferClientOutputs<AppRouterClient>;

export const link = new RPCLink({
  url: `${env.VITE_SERVER_URL}/rpc`,
  method: (_, path) => {
    // Use GET for rendering requests
    if (typeof window === "undefined") {
      return "GET";
    }

    // Use GET for read-like operations
    if (path.at(-1)?.match(/^(?:get|find|list|search)(?:[A-Z].*)?$/)) {
      return "GET";
    }

    return "POST";
  },
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
