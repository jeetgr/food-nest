import { expo } from "@better-auth/expo";
import { db } from "@foodnest/db";
import * as schema from "@foodnest/db/schema/auth";
import { env } from "@foodnest/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN, "foodnest://", "exp://"],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        default: "user",
      },
    },
  },
  plugins: [expo()],
});
