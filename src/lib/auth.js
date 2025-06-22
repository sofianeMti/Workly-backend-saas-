import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client, connect } from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();
await connect();

const mongoClient = client();
if (!mongoClient) {
  throw new Error("Client MongoDB non disponible pour Better Auth");
}
const db = mongoClient.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET || "default-secret-key-change-me",
  url: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: ["http://localhost:5173"],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
        defaultValue: "",
      },
      lastName: {
        type: "string",
        required: false,
        defaultValue: "",
      },
      phone: {
        type: "string",
        required: false,
        defaultValue: "",
      },
      // avatar: {
      //   type: "string",
      //   required: false,
      //   defaultValue: "",
      // },
    },
  },
  cookies: {
    maxAge: 14 * 24 * 60 * 60,
  },
});

console.log("Better Auth initialisé avec succès");

export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  next();
};

export const requireRole = (role) => (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  if (!req.session.user.roles || !req.session.user.roles.includes(role)) {
    return res.status(403).json({ error: "Accès non autorisé" });
  }

  next();
};
