import { MatchResultDto } from '../types';
import { getAuthHeaders } from './profile.service';

const getUserHeaders = (userId?: number) => ({
  'Content-Type': 'application/json',
  ...(userId ? { userId: String(userId) } : {}),
});

export const getMatchByTournament = async (
  tournamentId: number,
  userId?: number,
) => {
  const res = await fetch(`/api/matches/${tournamentId}`, {
    headers: getUserHeaders(userId),
  });
  if (!res.ok) return null;
  return res.json();
};

export const getMatchByTeam = async (teamId: number, userId?: number) => {
  const res = await fetch(`/api/matches/team/${teamId}`, {
    headers: getUserHeaders(userId),
  });
  if (!res.ok) return null;
  return res.json();
};

export const encodeResult = async (
  matchId: number,
  dto: MatchResultDto,
  token?: string,
) => {
  const res = await fetch(`/api/matches/${matchId}/results`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const errorText = await res.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(`${errorJson.error}: ${errorJson.message}`);
    } catch {
      throw new Error(`Erreur encodage résultat (${res.status}): ${errorText}`);
    }
  }

  const text = await res.text();
  if (!text || text.trim() === '') {
    throw new Error('Réponse vide du serveur');
  }

  return JSON.parse(text);
};
export const getMatchById = async (matchId: number) => {
  const res = await fetch(`/api/matches/match/${matchId}`);
  if (!res.ok) return null;
  return res.json();
};

export const teamValidate = async (
  matchId: number,
  teamId: number,
  token?: string,
) => {
  const res = await fetch(`/api/matches/validate/${matchId}/${teamId}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Erreur validation équipe');
  return res.json();
};

export const teamContest = async (
  matchId: number,
  teamId: number,
  token?: string,
) => {
  const res = await fetch(`/api/matches/contest/${matchId}/${teamId}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`Erreur API contest: ${res.status}`, errorBody);
    throw new Error(`Erreur contestation équipe (${res.status}): ${errorBody}`);
  }
  return res.json();
};

export const teamForfeit = async (
  matchId: number,
  teamId: number,
  token?: string,
) => {
  const res = await fetch(`/api/matches/forfeit/${matchId}/${teamId}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`Erreur API forfeit: ${res.status}`, errorBody);
    throw new Error(`Erreur déclaration forfait (${res.status}): ${errorBody}`);
  }
  return res.json();
};

export const assignAdministrator = async (
  matchId: number,
  adminId: number,
  token?: string,
) => {
  const res = await fetch(`/api/matches/assign/${matchId}/${adminId}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`Erreur API assign admin: ${res.status}`, errorBody);
    throw new Error(`Erreur assignation admin (${res.status}): ${errorBody}`);
  }
  return res.json();
};

export const getInscriptionMatchesByUser = async (
  userId: number,
  token: string,
) => {
  const res = await fetch(`/api/inscriptionMatches/user/${userId}`, {
    headers: getAuthHeaders(token),
  });

  if (res.status === 404) {
    return [];
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Impossible de récupérer les matchs (${res.status})${
        body ? `: ${body}` : ''
      }`,
    );
  }

  return res.json();
};

export const getTeamByUser = async (userId: string, token?: string) => {
  const res = await fetch(`/api/team/user/${userId}`, {
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
};

export const getMatchesByTeam = async (teamId: number, token: string) => {
  const res = await fetch(`/api/matches/team/${teamId}`, {
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
};
