import { useMemo, useState } from 'react';
import { LoginContext, Tournament } from '../../types';
import { useOpenTournaments } from './useOpenTournaments';

export const useRegisterTeamTournament = (
  authenticatedUser?: LoginContext['authenticatedUser'],
) => {
  const {
    tournaments,
    registeredTournaments,
    loading,
    inscriptionLoading,
    handleRegister,
    isAlreadyRegistered,
    getRegisteredCount,
    teamMembersCount,
  } = useOpenTournaments(authenticatedUser);

  const [expandedTournamentId, setExpandedTournamentId] = useState<
    number | null
  >(null);

  const toggleExpanded = (id: number) => {
    setExpandedTournamentId((prev) => (prev === id ? null : id));
  };

  const isFull = (tournament: Tournament) =>
    getRegisteredCount(tournament.id) >= tournament.nbrTeam;

  const availableTournaments = useMemo(
    () => tournaments.filter((t) => !isAlreadyRegistered(t.id)),
    [isAlreadyRegistered, tournaments],
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR');

  const hasEnoughMembers = teamMembersCount >= 4;

  return {
    expandedTournamentId,
    toggleExpanded,
    tournaments,
    availableTournaments,
    registeredTournaments,
    loading,
    inscriptionLoading,
    handleRegister,
    isAlreadyRegistered,
    getRegisteredCount,
    isFull,
    formatDate,
    hasEnoughMembers,
  };
};
