import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

await client.connect();

export const auth = betterAuth({
  database: mongodbAdapter(client.db()),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },

  session: {
    cookieCache: {
      enabled: true,
    },
  },

  secret: process.env.BETTER_AUTH_SECRET,

  baseURL: "https://e-book-platform-backend.vercel.app",

  trustedOrigins: [
    "https://e-book-platform-two.vercel.app"
  ],
});