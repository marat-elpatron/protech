import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { bearer } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    disableOriginCheck: process.env.NODE_ENV !== "production",
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [bearer()],
});
