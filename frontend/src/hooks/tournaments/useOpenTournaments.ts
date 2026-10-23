import { useState, useEffect, useCallback } from 'react';
import { Tournament, LoginContext } from '../../types';
import {
  getTournamentsByStatus,
  getTeamRegisteredTournaments,
  registerTeamToTournament,
} from '../../services/tournaments/tournament.service';
import {
  getTeamByUserId,
  getTeamMembersCount,
} from '../../services/tournaments/tournamentInscription.service';

interface UseOpenTournamentsResult {
  tournaments: Tournament[];
  registeredTournaments: Tournament[];
  loading: boolean;
  inscriptionLoading: boolean;
  handleRegister: (tournamentId: number, token: string) => Promise<void>;
  isAlreadyRegistered: (tournamentId: number) => boolean;
  getRegisteredCount: (tournamentId: number) => number;
  teamMembersCount: number; // pour retenir le nbre de joueur
}

export const useOpenTournaments = (
  authenticatedUser?: LoginContext['authenticatedUser'],
): UseOpenTournamentsResult => {
  const [teamMembersCount, setTeamMembersCount] = useState<number>(0); // nbre de joueur dans la team
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [registeredTournaments, setRegisteredTournaments] = useState<
    Tournament[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [inscriptionLoading, setInscriptionLoading] = useState(false);
  const [teamId, setTeamId] = useState<number | null>(
    authenticatedUser?.team ? Number(authenticatedUser.team) : null,
  );
  const userId = authenticatedUser?.id;

  const fetchTournaments = useCallback(async () => {
    try {
      const data = await getTournamentsByStatus('INSCRIPTION_OUVERTE');
      setTournaments(data);
    } catch (err) {
      console.error(err);
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRegisteredTournaments = useCallback(
    async (currentTeamId: number) => {
      try {
        const data = await getTeamRegisteredTournaments(currentTeamId);
        setRegisteredTournaments(data as Tournament[]);
      } catch (error) {
        console.error(error);
        setRegisteredTournaments([]);
      }
    },
    [],
  );

  const resolveTeamId = useCallback(async (): Promise<number | null> => {
    if (teamId) return teamId;
    if (!authenticatedUser?.id) return null;

    try {
      const team = await getTeamByUserId(
        authenticatedUser.id,
        authenticatedUser.token,
      );
      setTeamId(team.id);
      return team.id;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [teamId, authenticatedUser]);

  const handleRegister = useCallback(
    async (tournamentId: number, token: string) => {
      if (!userId) {
        alert("Impossible d'inscrire l'équipe : utilisateur introuvable");
        return;
      }

      try {
        setInscriptionLoading(true);
        const resolvedTeamId = await resolveTeamId();
        if (!resolvedTeamId) {
          alert("Impossible d'inscrire l'équipe : équipe introuvable");
          return;
        }

        await registerTeamToTournament(
          tournamentId,
          resolvedTeamId,
          userId,
          token,
        );
        alert(`Inscription au tournoi réussie !`);
        await Promise.all([
          fetchRegisteredTournaments(resolvedTeamId),
          fetchTournaments(),
        ]);
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Erreur inconnue';
        alert(`Erreur : ${errorMsg}`);
        console.error(errorMsg);
      } finally {
        setInscriptionLoading(false);
      }
    },
    [fetchTournaments, fetchRegisteredTournaments, resolveTeamId, userId],
  );

  const isAlreadyRegistered = useCallback(
    (tournamentId: number) =>
      registeredTournaments.some((t) => t.id === tournamentId),
    [registeredTournaments],
  );

  const getRegisteredCount = useCallback(
    (tournamentId: number) =>
      tournaments.find((t) => t.id === tournamentId)?.nbrTeamInscrite ??
      registeredTournaments.find((t) => t.id === tournamentId)
        ?.nbrTeamInscrite ??
      0,
    [tournaments, registeredTournaments],
  );

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  useEffect(() => {
    const fetchUserTeam = async () => {
      if (!authenticatedUser?.id) {
        setTeamId(null);
        return;
      }
      try {
        const team = await getTeamByUserId(
          authenticatedUser.id,
          authenticatedUser.token,
        );
        setTeamId(team.id);
        const count = await getTeamMembersCount(
          team.id,
          authenticatedUser.token,
        );
        setTeamMembersCount(count);
        fetchRegisteredTournaments(team.id);
      } catch (error) {
        console.error(error);
        setTeamId(null);
        setRegisteredTournaments([]);
      }
    };

    fetchUserTeam();
  }, [authenticatedUser, fetchRegisteredTournaments]);

  return {
    tournaments,
    registeredTournaments,
    loading,
    inscriptionLoading,
    handleRegister,
    isAlreadyRegistered,
    getRegisteredCount,
    teamMembersCount,
  };
};
