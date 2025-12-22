import { fakerEN_US as faker } from "@faker-js/faker";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { anonymous, username } from "better-auth/plugins";
import { db } from "@/db/drizzle";
import * as authSchema from "@/db/schema/auth-schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: authSchema,
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
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
    nextCookies(),
  ],
  trustedOrigins: ["http://localhost:3000", "https://*.csb.app"],
});
