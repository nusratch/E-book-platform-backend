import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import dotenv from "dotenv";

dotenv.config();

export const auth = betterAuth({
  database: mongodbAdapter(process.env.MONGO_URI),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  secret: process.env.BETTER_AUTH_SECRET,

  baseURL: "https://e-book-platform-backend.vercel.app",

  trustedOrigins: [
    "https://e-book-platform-two.vercel.app",
  ],
});