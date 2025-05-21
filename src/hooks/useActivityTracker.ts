import { useEffect } from 'react';
import { useAuthContext } from '@/hooks/useAuthContext';

// Durée d'inactivité avant déconnexion (en millisecondes)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Hook pour suivre l'activité de l'utilisateur et le déconnecter après une période d'inactivité
 */
export const useActivityTracker = () => {
  const { isAuthenticated, logout } = useAuthContext();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Fonction pour mettre à jour l'horodatage de la dernière activité
    const updateLastActivity = () => {
      localStorage.setItem('lastActivity', new Date().getTime().toString());
    };

    // Fonction pour vérifier si l'utilisateur est inactif
    const checkInactivity = () => {
      const lastActivity = localStorage.getItem('lastActivity');
      
      if (lastActivity) {
        const now = new Date().getTime();
        const lastActivityTime = parseInt(lastActivity, 10);
        
        if (now - lastActivityTime > INACTIVITY_TIMEOUT) {
          // L'utilisateur est inactif depuis trop longtemps, le déconnecter
          logout();
        }
      }
    };

    // Mettre à jour l'horodatage de la dernière activité au chargement
    updateLastActivity();

    // Configurer les écouteurs d'événements pour suivre l'activité
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateLastActivity);
    });

    // Vérifier l'inactivité toutes les minutes
    const intervalId = setInterval(checkInactivity, 60 * 1000);

    // Nettoyer les écouteurs d'événements et l'intervalle
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateLastActivity);
      });
      clearInterval(intervalId);
    };
  }, [isAuthenticated, logout]);
};
