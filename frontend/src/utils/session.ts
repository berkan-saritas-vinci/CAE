import { AuthenticatedUser, MaybeAuthenticatedUser } from '../types';

const clearAuthenticatedUser = () => {
  localStorage.removeItem('authenticatedUser');
  sessionStorage.removeItem('isAdminMode');
  sessionStorage.removeItem('authenticatedUser');
};

const storeAuthenticatedUser = (authenticatedUser: AuthenticatedUser) => {
  localStorage.setItem('authenticatedUser', JSON.stringify(authenticatedUser));
};

const getAuthenticatedUser = (): MaybeAuthenticatedUser => {
  let authenticatedUser = localStorage.getItem('authenticatedUser');

  if (!authenticatedUser) {
    authenticatedUser = sessionStorage.getItem('authenticatedUser');
  }

  if (!authenticatedUser) {
    return;
  }
  return JSON.parse(authenticatedUser);
};

const getUserTeam = (): number | undefined => {
  const user = getAuthenticatedUser();
  return user?.team ? Number(user.team) : undefined;
};

export {
  clearAuthenticatedUser,
  storeAuthenticatedUser,
  getAuthenticatedUser,
  getUserTeam,
};
