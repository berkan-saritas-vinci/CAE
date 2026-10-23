import { useState } from 'react';
import { emailChecker } from '../utils/utils';
import { LoginContext } from '../types';

export const useLogin = (loginUser: LoginContext['loginUser']) => {
  const [mailError, setMailError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (
    mail: string,
    password: string,
    rememberMe: boolean,
  ) => {
    try {
      setLoading(true);

      if (!emailChecker(mail)) {
        setMailError('Veuillez entrez une adresse email valide');
        return false;
      }

      await loginUser({ mail, password }, rememberMe);
      return true;
    } catch (err) {
      console.error('useLogin::error', err);
      setLoginError('Adresse mail ou mot de passe incorrect');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLogin,
    mailError,
    setMailError,
    loginError,
    setLoginError,
    loading,
  };
};
