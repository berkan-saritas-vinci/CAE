import { useEffect, useState } from 'react';
import {
  encodeResult,
  getMatchByTournament,
  teamValidate as validateTeamService,
  teamContest as contestTeamService,
  teamForfeit as forfeitTeamService,
  assignAdministrator as assignAdministratorService,
} from '../services/match.service';
import { Match, MatchResultDto } from '../types';
import { getAuthenticatedUser } from '../utils/session';

export const useMatch = (tournamentId?: number, token?: string) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = getAuthenticatedUser();
  const userId = user?.id;

  useEffect(() => {
    if (!tournamentId || !userId) return;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getMatchByTournament(tournamentId, userId);
        setMatches(data ?? []);
      } catch (e) {
        const message =
          e instanceof Error
            ? e.message
            : 'Erreur lors du chargement des matchs';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [tournamentId, userId]);

  // --------------- Méthodes -------------

  const getToken = () => token ?? getAuthenticatedUser()?.token;

  const adminEncode = async (matchId: number, dto: MatchResultDto) => {
    const updated = await encodeResult(matchId, dto, getToken());
    setMatches((prev) => prev.map((m) => (m.id === matchId ? updated : m)));
  };

  const teamValidate = async (matchId: number, teamId: number) => {
    const updated = await validateTeamService(matchId, teamId, getToken());
    setMatches((prev) => prev.map((m) => (m.id === matchId ? updated : m)));
  };

  const teamContest = async (matchId: number, teamId: number) => {
    const updated = await contestTeamService(matchId, teamId, getToken());
    setMatches((prev) => prev.map((m) => (m.id === matchId ? updated : m)));
  };

  const teamForfeit = async (matchId: number, teamId: number) => {
    const updated = await forfeitTeamService(matchId, teamId, getToken());
    setMatches((prev) => prev.map((m) => (m.id === matchId ? updated : m)));
  };

  const assignAdministrator = async (matchId: number, adminId: number) => {
    const updated = await assignAdministratorService(
      matchId,
      adminId,
      getToken(),
    );
    setMatches((prev) => prev.map((m) => (m.id === matchId ? updated : m)));
  };

  return {
    matches,
    loading,
    error,
    adminEncode,
    teamValidate,
    teamContest,
    teamForfeit,
    assignAdministrator,
  };
};
