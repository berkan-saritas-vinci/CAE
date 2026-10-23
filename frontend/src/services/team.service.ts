import { NewTeam } from '../types';
import { getAuthHeaders } from './profile.service';

export const getTeamByUserId = async (userId: number, token?: string) => {
  const res = await fetch(`/api/team/user/${userId}`, {
    headers: token ? getAuthHeaders(token) : {},
  });
  if (!res.ok) return null;
  return res.json();
};

export const getUserById = async (userId: number | string) => {
  const res = await fetch(`/api/auths/users/${userId}`);
  if (!res.ok) return null;
  return res.json();
};

export const getTeamMembers = async (teamId: number, token?: string) => {
  const res = await fetch(`/api/team/${teamId}/members`, {
    headers: token ? getAuthHeaders(token) : {},
  });
  if (!res.ok) return [];
  return res.json();
};

export const quitTeam = async (userId: number, token: string) => {
  const res = await fetch(`/api/team/user/${userId}/quit`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Impossible de quitter la team');
};

export const setSecondResponsable = async (
  teamId: number,
  membreId: number,
  token: string,
) => {
  await fetch(`/api/team/${teamId}/second-responsable/${membreId}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
  });
};

export const createTeam = async (newTeam: NewTeam) => {
  const res = await fetch('/api/team', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTeam),
  });
  if (!res.ok) throw new Error('Erreur création team');
  return res.json();
};

export const getTeamsWithMembers = async () => {
  const res = await fetch('/api/team/with-members');
  if (!res.ok) throw new Error('Erreur récupération teams');
  return res.json();
};

export const envoyerDemande = async (teamId: number, userId: number) => {
  const res = await fetch(`/api/adhesions/${teamId}?userId=${userId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Erreur envoi demande');
};

export const annulerDemande = async (teamId: number, userId: number) => {
  const res = await fetch(`/api/adhesions/${teamId}?userId=${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erreur annulation demande');
};

export async function setResponsable(
  teamId: number,
  userId: number,
  token?: string,
) {
  await fetch(`/api/team/${teamId}/responsable/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
  });
}

export const excludeMember = async (
  teamId: number,
  userId: number,
  token: string,
) => {
  const res = await fetch(`/api/team/${teamId}/exclude/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de l'exclusion du membre");
  }
};

export const isResponsable = async (
  name: string,
  userId: number,
  token?: string,
) => {
  const res = await fetch(`/api/team/${name}/${userId}`, {
    headers: token ? getAuthHeaders(token) : {},
  });
  if (!res.ok) return false;
  return res.json();
};
