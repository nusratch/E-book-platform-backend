const { betterAuth } = require("better-auth");
const { mongodbAdapter } = require("@better-auth/mongo-adapter");

const auth = betterAuth({
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

module.exports = { auth };