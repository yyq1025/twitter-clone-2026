import { fakerEN_US as faker } from "@faker-js/faker";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous, username } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/db";
import * as authSchema from "@/db/schema/better-auth";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
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
            const firstName = user.name.split(" ")[0];
            const lastName = user.name.split(" ")[1];
            user.username = faker.internet.username({ firstName, lastName });
          }
          return { data: user };
        },
      },
    },
  },
  plugins: [
    anonymous({
      generateName: () =>
        `${faker.person.firstName()} ${faker.person.lastName()}`,
    }),
    username(),
    tanstackStartCookies(),
  ],
});
