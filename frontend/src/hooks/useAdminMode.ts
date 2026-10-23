import { useState } from 'react';

// Enregistrer local du mode actuel
export const useAdminMode = () => {
  const [isAdminMode, setIsAdminMode] = useState(() => {
    return sessionStorage.getItem('isAdminMode') === 'true';
  });

  const toggleAdminMode = () => {
    const newMode = !isAdminMode;
    setIsAdminMode(newMode);
    sessionStorage.setItem('isAdminMode', newMode.toString());
  };

  const disableAdminMode = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      sessionStorage.removeItem('isAdminMode');
    }
  };

  return { isAdminMode, toggleAdminMode, disableAdminMode };
};
