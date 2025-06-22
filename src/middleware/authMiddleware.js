import { requireAuth, requireRole } from "../lib/auth.js";

/**
 * Utilisation des middlewares intégrés de Better Auth
 *
 * Better Auth fournit déjà des middlewares pour la gestion des sessions
 * et des rôles utilisateur. Nous les réexportons simplement ici pour
 * une utilisation cohérente dans notre application.
 */

// Middleware pour vérifier si l'utilisateur est administrateur
const requireAdmin = requireRole(["admin"]);

export { requireAuth, requireRole, requireAdmin };
