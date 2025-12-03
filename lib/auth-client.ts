import { createAuthClient } from "better-auth/react";
import {
  anonymousClient,
  usernameClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [
    anonymousClient(),
    usernameClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});
