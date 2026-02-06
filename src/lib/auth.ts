import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, anonymous, username } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import Chance from "chance";
import { db } from "@/db";
import * as authSchema from "@/db/schema/better-auth";

const chance = new Chance();

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  rateLimit: {
    enabled: process.env.BETTER_AUTH_DISABLE_RATE_LIMIT !== "1",
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: authSchema,
  }),
  user: {
    additionalFields: {
      postsCount: {
        type: "number",
        defaultValue: 0,
      },
      followersCount: {
        type: "number",
        defaultValue: 0,
      },
      followsCount: {
        type: "number",
        defaultValue: 0,
      },
      lastSeenNotificationId: {
        type: "number",
        defaultValue: 0,
      },
      bio: {
        type: "string",
        defaultValue: "",
      },
      isBot: {
        type: "boolean",
        defaultValue: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!user.username) {
            user.username = chance.word();
          }
          return { data: user };
        },
      },
    },
  },
  plugins: [
    anonymous({
      generateName: () => chance.name(),
    }),
    username({
      usernameValidator: (username) => {
        return /^[\w]+$/.test(username);
      },
    }),
    admin(),
    tanstackStartCookies(),
  ],
});
