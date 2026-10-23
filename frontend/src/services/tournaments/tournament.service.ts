import { NewTournament } from '../../types';
import { getAuthHeaders } from '../profile.service';

export const getAllTournaments = async () => {
  const response = await fetch(`api/tournaments/all`);

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des tournois');
  }

  return await response.json();
};

export const getTournamentsByStatus = async (status: string) => {
  const response = await fetch(`api/tournaments/all/${status}`);

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des tournois');
  }

  return await response.json();
};

export const getTournamentsById = async (id: number) => {
  //  proxy Vite fonctionne dans cas ci avec un chemin absolu car on est dans /tournamentPage/:tournamentId
  const response = await fetch(`/api/tournaments/id/${id}`);

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération du tournoi');
  }

  return await response.json();
};

export const createTournament = async (
  tournament: NewTournament,
  token: string,
) => {
  const response = await fetch(`/api/tournaments`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(tournament),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la création du tournoi : ${errorText}`);
  }

  return await response.json();
};

export const publishTournament = async (id: number, token: string) => {
  const response = await fetch(`/api/tournaments/publish/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la sauvegarde du tournoi : ${errorText}`);
  }

  return await response.json();
};

export const updateTournament = async (
  id: number,
  tournament: NewTournament,
  token: string,
) => {
  const response = await fetch(`/api/tournaments/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(tournament),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la mise à jour du tournoi : ${errorText}`);
  }

  return await response.json();
};

export const registerTeamToTournament = async (
  idTournament: number,
  idTeam: number,
  userId: number,
  token: string,
) => {
  const response = await fetch(
    `/api/inscriptiontournament/register/${idTournament}/team/${idTeam}`,
    {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        teamId: idTeam,
        tournamentId: idTournament,
        userId: userId,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de l'inscription : ${errorText}`);
  }

  return await response.json();
};

export const getTeamRegisteredTournaments = async (teamId: number) => {
  const response = await fetch(`/api/inscriptiontournament/team/${teamId}`);

  if (!response.ok) {
    throw new Error(
      "Erreur lors de la récupération des inscriptions de l'équipe",
    );
  }

  const inscriptions = await response.json();
  return inscriptions
    .map(
      (inscription: { tournament?: NewTournament & { id: number } }) =>
        inscription.tournament,
    )
    .filter(Boolean) as Array<NewTournament & { id: number }>;
};

export const getTournamentRegistrationCounts = async () => {
  const response = await fetch('/api/inscriptiontournament/counts');

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération du nombre d'inscriptions");
  }

  return (await response.json()) as Record<string, number>;
};

export const getTournamentMatches = async (
  tournamentId: number,
  token: string,
) => {
  const response = await fetch(`/api/matches/${tournamentId}`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des matches du tournoi');
  }

  return await response.json();
};

export const generateTournamentMatch = async (
  tournamentId: number,
  token: string,
) => {
  const response = await fetch(`/api/matches/matchGeneration/${tournamentId}`, {
    method: 'POST',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erreur lors de l'initialisation des matches : ${errorText}`,
    );
  }

  return await response.json();
};

export const initializeTeamMatch = async (
  tournamentId: number,
  token: string,
) => {
  const response = await fetch(`/api/matches/init/${tournamentId}`, {
    method: 'POST',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erreur lors de la répartition des équipes dans les matches : ${errorText}`,
    );
  }

  return await response.json();
};

export const getTournamentsByUserId = async (userId: number) => {
  const response = await fetch(`/api/tournaments/user/${userId}`);

  if (!response.ok) {
    throw new Error(
      "Erreur lors de la récupération des tournois de l'utilisateur",
    );
  }

  return await response.json();
};

export const setTournamentState = async (
  tournamentId: number,
  token?: string,
) => {
  const response = await fetch(`/api/tournaments/${tournamentId}/state`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la mise à jour de l'état : ${errorText}`);
  }
  console.log(`Tournoi ${tournamentId} mis à jour avec succès`);
  return await response.json();
};
