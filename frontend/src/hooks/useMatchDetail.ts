import { useCallback, useEffect, useState } from 'react';
import {
  getMatchByTournament,
  teamValidate as teamValidateService,
} from '../services/match.service';
import type { Match as MatchType, AuthenticatedUser } from '../types';

export const useMatchDetail = (
  tournamentId: number,
  matchId: number,
  authenticatedUser: AuthenticatedUser | undefined,
) => {
  const [match, setMatch] = useState<MatchType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAutoValidationWindowExpired = (currentMatch: MatchType) => {
    if (!currentMatch.dateTime) return false;

    const matchDate = new Date(currentMatch.dateTime);
    if (Number.isNaN(matchDate.getTime())) return false;

    const twoHoursInMs = 2 * 60 * 60 * 1000;
    return Date.now() >= matchDate.getTime() + twoHoursInMs;
  };

  const canAutoValidate = (currentMatch: MatchType) => {
    return (
      currentMatch.status === 'TERMINED' ||
      currentMatch.status === 'TERMINE' ||
      currentMatch.status === 'VALIDATE_BY_TEAM1' ||
      currentMatch.status === 'VALIDATE_BY_TEAM2'
    );
  };

  const autoValidateWithExistingEndpoints = useCallback(
    async (currentMatch: MatchType) => {
      if (!authenticatedUser?.token) return currentMatch;
      if (
        !canAutoValidate(currentMatch) ||
        !isAutoValidationWindowExpired(currentMatch)
      ) {
        return currentMatch;
      }

      let updatedMatch = currentMatch;
      const team1Id = currentMatch.team1?.id;
      const team2Id = currentMatch.team2?.id;

      const shouldValidateTeam1 = !currentMatch.team1Validated;
      const shouldValidateTeam2 = !currentMatch.team2Validated;

      if (shouldValidateTeam1 && team1Id) {
        updatedMatch = await teamValidateService(
          currentMatch.id,
          team1Id,
          authenticatedUser.token,
        );
      }

      if (shouldValidateTeam2 && team2Id) {
        updatedMatch = await teamValidateService(
          currentMatch.id,
          team2Id,
          authenticatedUser.token,
        );
      }

      return updatedMatch;
    },
    [authenticatedUser?.token],
  );

  useEffect(() => {
    const loadMatch = async () => {
      if (Number.isNaN(tournamentId) || Number.isNaN(matchId)) {
        setIsLoading(false);
        return;
      }

      const tournamentMatches = await getMatchByTournament(
        tournamentId,
        authenticatedUser?.id,
      );

      if (Array.isArray(tournamentMatches)) {
        const foundMatch = tournamentMatches.find(
          (m: MatchType) => m.id === matchId,
        );
        if (foundMatch) {
          try {
            const updatedMatch =
              await autoValidateWithExistingEndpoints(foundMatch);
            setMatch(updatedMatch);
          } catch (error) {
            console.error('Erreur auto-validation après 2h:', error);
            setMatch(foundMatch);
          }
        } else {
          setMatch(null);
        }
      }

      setIsLoading(false);
    };

    loadMatch();
  }, [
    matchId,
    tournamentId,
    authenticatedUser?.id,
    autoValidateWithExistingEndpoints,
  ]);

  const formatDateTime = (value?: string | Date) => {
    if (!value) return 'Date inconnue';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date invalide';
    return date.toLocaleString('fr-BE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayedScore = (match: MatchType, canSeeScore: boolean) => {
    if (match.status === 'PLANNED') {
      return '---';
    }

    // Check if it's a forfeit (one score is -1)
    if (match.resultTeam1 === -1 || match.resultTeam2 === -1) {
      if (match.resultTeam1 === -1) {
        return `Forfait ${match.team2?.name || 'Équipe 2'} remporte le match`;
      }
      return `Forfait ${match.team1?.name || 'Équipe 1'} remporte le match`;
    }

    // Normal score display
    if (canSeeScore) {
      return `${match.resultTeam1 ?? '-'} - ${match.resultTeam2 ?? '-'}`;
    }

    return 'Score en attente de validation';
  };

  const handleValidate = async (
    teamValidate: (matchId: number, teamId: number) => Promise<void>,
    userTeamId: number,
  ) => {
    if (hasVoted) {
      alert('Vous avez déjà voté sur ce match');
      return;
    }

    if (!userTeamId) {
      alert('Vous devez avoir une équipe');
      return;
    }

    setIsSubmitting(true);
    try {
      await teamValidate(matchId, userTeamId);
      setHasVoted(true);
      alert('Résultat validé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContest = async (
    teamContest: (matchId: number, teamId: number) => Promise<void>,
    userTeamId: number,
  ) => {
    if (hasVoted) {
      alert('Vous avez déjà voté sur ce match');
      return;
    }

    if (!userTeamId) {
      alert('Vous devez avoir une équipe');
      return;
    }

    setIsSubmitting(true);
    try {
      await teamContest(matchId, userTeamId);
      setHasVoted(true);
      alert('Résultat contesté avec succès !');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de la contestation:', error);
      alert(`Erreur lors de la contestation: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForfeit = async (
    teamForfeit: (matchId: number, teamId: number) => Promise<void>,
    userTeamId: number,
  ) => {
    if (!userTeamId) {
      alert('Vous devez avoir une équipe');
      return;
    }

    const confirmForfeit = confirm(
      'Êtes-vous sûr de vouloir déclarer forfait ? Cette action ne peut pas être annulée.',
    );
    if (!confirmForfeit) return;

    setIsSubmitting(true);
    try {
      await teamForfeit(matchId, userTeamId);
      alert('Forfait déclaré avec succès !');
      window.location.reload();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de la déclaration de forfait:', error);
      alert(`Erreur lors de la déclaration de forfait: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    match,
    isLoading,
    hasVoted,
    setHasVoted,
    isSubmitting,
    setIsSubmitting,
    formatDateTime,
    displayedScore,
    handleValidate,
    handleContest,
    handleForfeit,
  };
};
