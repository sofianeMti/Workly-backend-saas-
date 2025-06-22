import express from "express";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cors from "cors";
import morgan from "morgan";

dotenv.config();
const app = express();

// Middleware de logging pour toutes les requêtes
app.use(morgan("dev"));

// Configuration CORS plus précise pour Better Auth
app.use(
  cors({
    origin: "http://localhost:5173", // URL de votre frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Important pour les cookies d'authentification
  })
);

console.log("Initialisation du middleware Better Auth");

// Utiliser la syntaxe de route Express standard au lieu de {*any}
app.all("/api/auth/*", toNodeHandler(auth));

// Middleware pour parser le JSON APRÈS Better Auth
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());
app.use((req, res, next) => {
  if (req.body) {
    console.log("Request body:", JSON.stringify(req.body));
  }
  next();
});

// Routes de base
app.get("/", (req, res) => res.send("Welcome to AbonnTrack API!"));

export default app;
