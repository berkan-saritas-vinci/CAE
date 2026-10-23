import { useState } from 'react';

export const useTournamentMatchPage = (tournamentId: number) => {
  const [teamsInitialized, setTeamsInitialized] = useState(() => {
    return (
      sessionStorage.getItem(`tournament_${tournamentId}_teams_initialized`) ===
      'true'
    );
  });

  const [assigningAdmin, setAssigningAdmin] = useState<number | null>(null);

  const formatDateTime = (value: string | Date) => {
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

  const handleAssignAdmin = async (
    matchId: number,
    adminId: number | undefined,
    assignAdministrator: (matchId: number, adminId: number) => Promise<void>,
  ) => {
    if (!adminId) {
      alert('Vous devez être connecté');
      return;
    }

    setAssigningAdmin(matchId);
    try {
      await assignAdministrator(matchId, adminId);
      alert('Vous avez été assigné comme arbitre du match !');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      console.error("Erreur lors de l'assignation:", error);
      alert(`Erreur lors de l'assignation: ${errorMessage}`);
    } finally {
      setAssigningAdmin(null);
    }
  };

  // set setTeamsInitialized à true pour signifier que les teams ont été réparti
  const markTeamsAsInitialized = () => {
    sessionStorage.setItem(
      `tournament_${tournamentId}_teams_initialized`,
      'true',
    );
    setTeamsInitialized(true);
  };

  return {
    teamsInitialized,
    assigningAdmin,
    formatDateTime,
    handleAssignAdmin,
    markTeamsAsInitialized,
  };
};
