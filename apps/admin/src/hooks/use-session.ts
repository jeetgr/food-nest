import type {} from "@tanstack/react-router";
import type {
  UseRouteContextOptions,
  UseRouteContextResult,
} from "@tanstack/router-core";

import { type RegisteredRouter, useRouteContext } from "@tanstack/react-router";

export function useSession<TSelected>(
  opts: Omit<
    UseRouteContextOptions<RegisteredRouter, "/(protected)", true, TSelected>,
    "from"
  >,
): UseRouteContextResult<RegisteredRouter, "/(protected)", true, TSelected> {
  return useRouteContext({ from: "/(protected)", strict: true, ...opts });
}
