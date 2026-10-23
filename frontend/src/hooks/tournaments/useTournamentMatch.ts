import { useCallback, useEffect, useState } from 'react';
import { Match } from '../../types';
import {
  getTournamentMatches,
  generateTournamentMatch,
  initializeTeamMatch,
} from '../../services/tournaments/tournament.service';

export function useTournamentMatch(tournamentId: number, token: string) {
  const [matches, setMatches] = useState<Match[]>([]);

  const fetchMatches = useCallback(async () => {
    try {
      const data = await getTournamentMatches(tournamentId, token);
      setMatches(data);
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des matches du tournoi :',
        error,
      );
    }
  }, [tournamentId, token]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return { matches, refetch: fetchMatches };
}

export function useGenerateTournamentMatches(
  tournamentId: number,
  token: string,
  onSuccess?: () => void | Promise<void>,
) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeMatches = async (refetch?: () => Promise<void>) => {
    setIsInitializing(true);
    setError(null);

    try {
      await generateTournamentMatch(tournamentId, token);
      // on attend un peu pour que la db soit update entèrement
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (refetch) {
        await refetch();
      }
      if (onSuccess) {
        await Promise.resolve(onSuccess());
      }
    } catch (err) {
      console.error("Erreur lors de l'initialisation des matches :", err);
      setError('Les matches ont déjà été initialisés !');
    } finally {
      setIsInitializing(false);
    }
  };

  return { initializeMatches, isInitializing, error };
}

export function useInitTeamTournament(
  tournamentId: number,
  token: string,
  onSuccess?: () => void | Promise<void>,
) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitializeTeams = async (refetch?: () => Promise<void>) => {
    setIsInitializing(true);
    setError(null);

    try {
      await initializeTeamMatch(tournamentId, token);
      // on attend un peu pour que la db soit update entèrement
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (refetch) {
        await refetch();
      }
      if (onSuccess) {
        await Promise.resolve(onSuccess());
      }
    } catch (err) {
      console.error("Erreur lors de l'initialisation des équipes :", err);
      setError("Erreur lors de l'initialisation des équipes");
    } finally {
      setIsInitializing(false);
    }
  };

  return { handleInitializeTeams, isInitializing, error };
}
