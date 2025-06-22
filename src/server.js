import app from "./app.js";
import { connect } from "./config/db.js";

const PORT = process.env.PORT || 3000;

// Connexion à la base de données
// Note: La connexion est déjà établie lors de l'importation du module,
// mais nous pouvons l'appeler explicitement ici si nécessaire
// connect();

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
