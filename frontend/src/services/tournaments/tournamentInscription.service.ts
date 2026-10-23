import { Team, TeamResponse } from '../../types';
import { getAuthHeaders } from '../profile.service';

const getTeamByUserId = async (userId: number, token?: string) => {
  const response = await fetch(`/api/team/user/${userId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error('Impossible de récupérer la team utilisateur');
  }

  return (await response.json()) as Team;
};

const registerTeamToTournament = async (
  tournamentId: number,
  teamId: number,
  token: string,
) => {
  const response = await fetch('/api/inscriptiontournament/create', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      tournament: { id: tournamentId },
      team: { id: teamId },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de l'inscription au tournoi : ${errorText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const getTeamsByTournamentId = async (
  tournamentId: number,
  token?: string,
): Promise<TeamResponse[]> => {
  const response = await fetch(
    `/api/inscriptiontournament/tournament/${tournamentId}/teams`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  if (!response.ok) {
    throw new Error('Impossible de récupérer les équipes du tournoi');
  }

  return (await response.json()) as TeamResponse[];
};

const getTeamMembersCount = async (
  teamId: number,
  token?: string,
): Promise<number> => {
  const response = await fetch(`/api/team/${teamId}/members`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) return 0;
  const members = await response.json();
  return members.length;
};

export {
  getTeamByUserId,
  registerTeamToTournament,
  getTeamsByTournamentId,
  getTeamMembersCount,
};
