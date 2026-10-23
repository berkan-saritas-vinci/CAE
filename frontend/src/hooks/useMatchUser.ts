import { useEffect, useState } from 'react';
import {
  getInscriptionMatchesByUser,
  getTeamByUser,
  getMatchesByTeam,
} from '../services/match.service';
import type { Match as MatchType, Tournament } from '../types';
import { getAuthenticatedUser } from '../utils/session';

type MatchWithTournament = Omit<MatchType, 'tournament'> & {
  tournament: Tournament;
};

export const useMatchUser = (userId?: string) => {
  const [matches, setMatches] = useState<MatchWithTournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authenticatedUser = getAuthenticatedUser();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const targetUserId = userId ?? authenticatedUser?.id?.toString();
        if (!targetUserId) {
          setMatches([]);
          return;
        }

        const token = authenticatedUser?.token;
        if (!token) {
          return;
        }

        // Try to get inscription matches first
        const inscriptionMatches = await getInscriptionMatchesByUser(
          Number(targetUserId),
          token,
        );

        if ((inscriptionMatches ?? []).length > 0) {
          setMatches(inscriptionMatches);
          return;
        }

        // Fallback: user may have no explicit selections but still has team matches
        const team = await getTeamByUser(targetUserId, token);

        if (!team?.id) {
          setMatches([]);
          return;
        }

        const teamMatches = await getMatchesByTeam(team.id, token);
        setMatches(teamMatches ?? []);
      } catch (fetchError) {
        console.error('Error fetching matches:', fetchError);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Une erreur est survenue lors du chargement des matchs.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [authenticatedUser?.id, authenticatedUser?.token, userId]);

  return { matches, isLoading, error };
};
