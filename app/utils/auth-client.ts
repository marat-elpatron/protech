import { createAuthClient } from "better-auth/vue";

export const authClient = createAuthClient();

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role?: "USER" | "ADMIN";
};
