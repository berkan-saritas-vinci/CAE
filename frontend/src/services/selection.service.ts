import { getAuthHeaders } from './profile.service';

export const setSelection = async (
  matchId: number,
  teamId: number,
  userId: number,
  token?: string,
) => {
  const res = await fetch(
    `/api/inscriptionMatches?match=${matchId}&team.id=${teamId}&user.id=${userId}`,
    {
      method: 'POST',
      headers: getAuthHeaders(token),
    },
  );
  if (!res.ok) return null;
  return res.json();
};

export const deleteSelection = async (
  matchId: number,
  teamId: number,
  userId: number,
  token?: string,
) => {
  const res = await fetch(
    `/api/inscriptionMatches?match=${matchId}&team.id=${teamId}&user.id=${userId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    },
  );
  if (!res.ok) return false;
  return true;
};

export const getSelectionsByMatch = async (matchId: number, token?: string) => {
  const res = await fetch(`/api/inscriptionMatches/match/${matchId}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) return [];
  return res.json();
};
