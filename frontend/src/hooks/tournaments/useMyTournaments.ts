import { useState, useEffect } from 'react';
import { Tournament, LoginContext } from '../../types';
import { getInscriptionMatchesByUser } from '../../services/match.service';

type MatchWithTournament = {
  id: number;
  tournament: Tournament;
};

export const useMyTournaments = (
  authenticatedUser?: LoginContext['authenticatedUser'],
) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyRegisteredTournaments = async () => {
      if (!authenticatedUser?.id) {
        setTournaments([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const matches: MatchWithTournament[] =
          await getInscriptionMatchesByUser(
            authenticatedUser.id,
            authenticatedUser.token,
          );

        // Extract unique tournaments from matches
        const tournamentsMap = new Map<number, Tournament>();
        matches.map((match) => {
          if (match.tournament && !tournamentsMap.has(match.tournament.id)) {
            tournamentsMap.set(match.tournament.id, match.tournament);
          }
        });

        setTournaments(Array.from(tournamentsMap.values()));
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erreur inconnue');
        }
        setTournaments([]);
        console.error('Erreur lors du chargement', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRegisteredTournaments();
  }, [authenticatedUser]);

  return { tournaments, loading, error };
};
