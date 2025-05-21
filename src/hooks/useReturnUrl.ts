import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Hook pour gérer les redirections après authentification
 */
export const useReturnUrl = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Récupérer l'URL de retour depuis les paramètres de requête
  const getReturnUrl = (): string => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('returnUrl') || '/';
  };

  // Sauvegarder l'URL actuelle pour y revenir après authentification
  const saveCurrentUrl = (): void => {
    const currentPath = location.pathname + location.search;
    localStorage.setItem('returnUrl', currentPath);
  };

  // Récupérer l'URL sauvegardée et la supprimer du localStorage
  const getSavedUrl = (): string => {
    const savedUrl = localStorage.getItem('returnUrl');
    localStorage.removeItem('returnUrl');
    return savedUrl || '/';
  };

  // Rediriger vers l'URL de retour (soit depuis les paramètres, soit depuis localStorage)
  const redirectToReturnUrl = (): void => {
    const returnUrl = getReturnUrl();
    navigate(returnUrl === '/login' || returnUrl === '/signup' ? '/' : returnUrl);
  };

  return {
    getReturnUrl,
    saveCurrentUrl,
    getSavedUrl,
    redirectToReturnUrl
  };
};
