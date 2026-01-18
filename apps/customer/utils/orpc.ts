import type { AppRouterClient } from "server/src/orpc/routers";

import { env } from "@foodnest/env/native";
import {
  createORPCClient,
  type InferClientErrorUnion,
  type InferClientOutputs,
} from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

import { authClient } from "@/lib/auth-client";

export type ORPCClientError = InferClientErrorUnion<AppRouterClient>;
export type ORPCClientOutputs = InferClientOutputs<AppRouterClient>;

export const link = new RPCLink({
  url: `${env.EXPO_PUBLIC_SERVER_URL}/rpc`,
  method: (_, path) => {
    // Use GET for read-like operations (better caching)
    if (path.at(-1)?.match(/^(?:get|find|list|search)(?:[A-Z].*)?$/)) {
      return "GET";
    }
    return "POST";
  },
  headers() {
    const headers = new Map<string, string>();
    const cookies = authClient.getCookie();
    if (cookies) {
      headers.set("Cookie", cookies);
    }
    return Object.fromEntries(headers);
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
