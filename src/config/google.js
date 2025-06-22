import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

// Configuration pour l'authentification Google OAuth2
export const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/email/auth/google/callback",
  scopes: [
    "https://www.googleapis.com/auth/gmail.readonly", // Accès en lecture seule aux emails
    "https://www.googleapis.com/auth/userinfo.email", // Accès à l'email de l'utilisateur
  ],
};

// Création du client OAuth2
export const oauth2Client = new google.auth.OAuth2(
  googleConfig.clientId,
  googleConfig.clientSecret,
  googleConfig.redirectUri
);

// Création du client Gmail
export const gmail = google.gmail({ version: "v1" });

// Création du client People pour accéder aux informations du profil
export const people = google.people({ version: "v1" });

// Générer l'URL d'authentification
export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: "offline", // Pour obtenir un refresh token
    prompt: "consent", // Toujours demander le consentement
    scope: googleConfig.scopes,
  });
}

// Échanger le code d'autorisation contre des tokens
export async function getTokens(code) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Configurer le client OAuth2 avec les tokens
export function setCredentials(tokens) {
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

// Vérifier si les tokens sont valides
export async function validateTokens(tokens) {
  try {
    const client = new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret
    );
    client.setCredentials(tokens);
    
    // Tenter d'obtenir les informations utilisateur pour vérifier la validité des tokens
    const oauth2 = google.oauth2({ version: "v2", auth: client });
    await oauth2.userinfo.get();
    return true;
  } catch (error) {
    console.error("Erreur de validation des tokens:", error);
    return false;
  }
}

// Rafraîchir les tokens expirés
export async function refreshTokens(refreshToken) {
  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement des tokens:", error);
    throw error;
  }
}

// Récupérer le profil utilisateur
export async function getUserProfile() {
  try {
    // Utiliser l'API People pour obtenir les informations du profil
    const response = await people.people.get({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses,photos',
      auth: oauth2Client,
    });
    
    return {
      name: response.data.names?.[0]?.displayName || 'Utilisateur',
      email: response.data.emailAddresses?.[0]?.value || '',
      photo: response.data.photos?.[0]?.url || '',
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error);
    return {
      name: 'Utilisateur',
      email: '',
      photo: '',
    };
  }
}

// Récupérer des statistiques sur les emails
export async function getEmailStats() {
  try {
    // Obtenir la liste des labels pour voir le nombre d'emails par catégorie
    const labelsResponse = await gmail.users.labels.list({
      userId: 'me',
      auth: oauth2Client,
    });
    
    // Obtenir quelques emails récents pour analyse
    const messagesResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10, // Limiter à 10 emails pour ne pas surcharger
      auth: oauth2Client,
    });
    
    // Calculer des statistiques basiques
    const stats = {
      totalLabels: labelsResponse.data.labels?.length || 0,
      recentMessages: messagesResponse.data.messages?.length || 0,
      inboxCount: 0,
      sentCount: 0,
      draftCount: 0,
    };
    
    // Récupérer les compteurs pour certains labels importants
    if (labelsResponse.data.labels) {
      for (const label of labelsResponse.data.labels) {
        if (label.id === 'INBOX') {
          const inboxDetails = await gmail.users.labels.get({
            userId: 'me',
            id: 'INBOX',
            auth: oauth2Client,
          });
          stats.inboxCount = inboxDetails.data.messagesTotal || 0;
        }
        if (label.id === 'SENT') {
          const sentDetails = await gmail.users.labels.get({
            userId: 'me',
            id: 'SENT',
            auth: oauth2Client,
          });
          stats.sentCount = sentDetails.data.messagesTotal || 0;
        }
        if (label.id === 'DRAFT') {
          const draftDetails = await gmail.users.labels.get({
            userId: 'me',
            id: 'DRAFT',
            auth: oauth2Client,
          });
          stats.draftCount = draftDetails.data.messagesTotal || 0;
        }
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques email:', error);
    return {
      totalLabels: 0,
      recentMessages: 0,
      inboxCount: 0,
      sentCount: 0,
      draftCount: 0,
    };
  }
}

export default {
  googleConfig,
  oauth2Client,
  gmail,
  people,
  getAuthUrl,
  getTokens,
  setCredentials,
  validateTokens,
  refreshTokens,
  getUserProfile,
  getEmailStats,
};
