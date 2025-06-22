import mongoose from "mongoose";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

let mongoClient;

// Fonction pour se connecter à MongoDB
async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log("URI MongoDB:", uri ? "Définie" : "Non définie");

    if (!uri) {
      throw new Error(
        "La variable d'environnement MONGODB_URI n'est pas définie"
      );
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    mongoClient = mongoose.connection.getClient(); // Obtenir le client MongoDB natif
    console.log("MongoDB connected");
    return mongoClient;
  } catch (err) {
    console.error("Erreur de connexion MongoDB:", err.message);
    process.exit(1);
  }
}

// Connecter immédiatement
connectDB();

// Exporter le client MongoDB et la fonction de connexion
export const client = () => mongoClient;
export const connect = connectDB;
