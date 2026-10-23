import { AuthenticatedUser, MaybeAuthenticatedUser } from './src/types';

const clearAuthenticatedUser = () => {
  localStorage.removeItem('authenticatedUser');
};

const storeAuthenticatedUser = (authenticatedUser: AuthenticatedUser) => {
  localStorage.setItem('authenticatedUser', JSON.stringify(authenticatedUser));
};

const getAuthenticatedUser = (): MaybeAuthenticatedUser => {
  const authenticatedUser = localStorage.getItem('authenticatedUser');

  if (!authenticatedUser) return undefined;

  return JSON.parse(authenticatedUser);
};

export { clearAuthenticatedUser, storeAuthenticatedUser, getAuthenticatedUser };
