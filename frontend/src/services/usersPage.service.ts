import { User, Team } from '../types';
import { getAuthHeaders } from './profile.service';

export const fetchAllUsers = async (token?: string): Promise<User[]> => {
  const headers = token ? getAuthHeaders(token) : {};
  const res = await fetch('/api/auths/users', { headers });
  if (!res.ok) throw new Error('Erreur récupération utilisateurs');
  return res.json();
};

export const fetchAllTeams = async (): Promise<Team[]> => {
  const res = await fetch('/api/team/all');
  if (!res.ok) throw new Error('Erreur récupération teams');
  return res.json();
};

export const toggleUserRole = async (
  userId: number,
  token?: string,
): Promise<User> => {
  const res = await fetch(`/api/auths/users/setRole/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Erreur mise à jour rôle');
  return res.json();
};

export const banUser = async (
  userId: number,
  token?: string,
): Promise<User> => {
  const res = await fetch(`/api/auths/users/${userId}/ban`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Erreur bannissement');
  return res.json();
};

export const getUserByTag = async (tag: string) => {
  const response = await fetch(`/api/auths/users/tag/${tag}`);

  if (!response.ok) {
    throw new Error('Utilisateur non trouvé');
  }

  return await response.json();
};
