import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearAuthenticatedUser,
  getAuthenticatedUser,
  storeAuthenticatedUser,
} from '../utils/session';
import {
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  RegisterUser,
  User,
} from '../types';
import { fetchUserTeam } from '../services/profile.service';

export const useApp = () => {
  const [authenticatedUser, setAuthenticatedUser] =
    useState<MaybeAuthenticatedUser>(undefined);

  const [loginNotification, setLoginNotification] = useState(false);
  const [logoutNotification, setLogoutNotification] = useState(false);
  const [registrationNotification, setRegistrationNotification] =
    useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Charger l’utilisateur depuis le storage au démarrage
  useEffect(() => {
    const storedUser = getAuthenticatedUser();
    if (storedUser) {
      setAuthenticatedUser(storedUser);
    }
  }, []);

  // Inscription
  const registerUser = async (newUser: RegisterUser) => {
    try {
      const response = await fetch('api/auths/register', {
        method: 'POST',
        body: JSON.stringify({ ...newUser, role: 'USER' }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`,
        );
      }

      setRegistrationNotification(true);
    } catch (err) {
      console.error('registerUser::error: ', err);
      throw err;
    }
  };

  // Connexion
  const loginUser = async (user: User, rememberMe: boolean) => {
    try {
      const response = await fetch('/api/auths/login', {
        method: 'POST',
        body: JSON.stringify(user),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 403) {
        setLoginError('Ce compte est banni et ne peut plus se connecter.');
        return;
      }

      if (!response.ok) {
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`,
        );
      }

      const authenticatedUser: AuthenticatedUser = await response.json();
      console.log('Authenticated user from login:', authenticatedUser);

      // Récupérer la team de l'utilisateur
      try {
        const teamData = await fetchUserTeam(authenticatedUser.id);
        console.log('Team data retrieved:', teamData);

        if (teamData && teamData.id) {
          const userWithTeam = {
            ...authenticatedUser,
            team: teamData.id,
          };
          console.log('User with team:', userWithTeam);
          setAuthenticatedUser(userWithTeam);

          if (rememberMe) {
            storeAuthenticatedUser(userWithTeam);
          } else {
            sessionStorage.setItem(
              'authenticatedUser',
              JSON.stringify(userWithTeam),
            );
          }
        } else {
          console.warn('Team data is empty or invalid');
          setAuthenticatedUser(authenticatedUser);

          if (rememberMe) {
            storeAuthenticatedUser(authenticatedUser);
          } else {
            sessionStorage.setItem(
              'authenticatedUser',
              JSON.stringify(authenticatedUser),
            );
          }
        }
      } catch (teamError) {
        console.warn('Erreur lors de la récupération de la team:', teamError);
        setAuthenticatedUser(authenticatedUser);

        if (rememberMe) {
          storeAuthenticatedUser(authenticatedUser);
        } else {
          sessionStorage.setItem(
            'authenticatedUser',
            JSON.stringify(authenticatedUser),
          );
        }
      }

      setLoginNotification(true);
    } catch (err) {
      console.error('loginUser::error: ', err);
      throw err;
    }
  };

  const clearUser = () => {
    clearAuthenticatedUser();
    setAuthenticatedUser(undefined);
    setLogoutNotification(true);
    navigate('/');
  };

  return {
    authenticatedUser,
    setAuthenticatedUser,
    loginNotification,
    setLoginNotification,
    logoutNotification,
    setLogoutNotification,
    registrationNotification,
    setRegistrationNotification,
    loginError,
    setLoginError,
    registerUser,
    loginUser,
    clearUser,
  };
};
