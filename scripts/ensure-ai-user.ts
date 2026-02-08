import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema/better-auth";
import { auth } from "@/lib/auth";

const USERNAME = "ai";
const EMAIL = "bot+ai@internal.local";
const NAME = "AI";

async function ensureAiUser() {
  const existingUsers = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.username, USERNAME))
    .limit(1);

  const existingUser = existingUsers[0];

  if (existingUser) {
    console.log(
      `User with username "${USERNAME}" already exists (id=${existingUser.id}, email=${existingUser.email}).`,
    );
    return;
  }

  const password = randomUUID();

  const result = await auth.api.createUser({
    body: {
      email: EMAIL,
      password,
      name: NAME,
      data: {
        username: USERNAME,
        isBot: true,
      },
    },
  });

  console.log(
    `Created AI user with id=${result.user.id}, email=${result.user.email}`,
  );
}

ensureAiUser().catch((error) => {
  console.error("Failed to ensure AI user.", error);
  process.exitCode = 1;
});
