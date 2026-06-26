import { createAuthClient } from "better-auth/vue";

export const authClient = createAuthClient({
  baseURL: import.meta.client ? window.location.origin : "http://localhost:3000",
});

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role?: "USER" | "ADMIN";
};
