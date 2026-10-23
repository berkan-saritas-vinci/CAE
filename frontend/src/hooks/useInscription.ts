import { useEffect, useMemo, useState } from 'react';
import { AuthenticatedUser } from '../types';
import {
  getTeamByUserId,
  registerTeamToTournament,
} from '../services/tournaments/tournamentInscription.service';

type UseUserInscriptionParams = {
  authenticatedUser?: AuthenticatedUser;
  tournamentId?: number;
  tournamentStatus?: string;
};

const useUserInscription = ({
  authenticatedUser,
  tournamentId,
  tournamentStatus,
}: UseUserInscriptionParams) => {
  const [teamId, setTeamId] = useState<number | null>(null);
  const [isResponsible, setIsResponsible] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [inscriptionLoading, setInscriptionLoading] = useState(false);

  useEffect(() => {
    const loadUserTeam = async () => {
      if (!authenticatedUser?.id) {
        setTeamId(null);
        setIsResponsible(false);
        return;
      }

      try {
        setLoadingTeam(true);
        const team = await getTeamByUserId(
          authenticatedUser.id,
          authenticatedUser.token,
        );
        const roleIsResponsible =
          authenticatedUser.role?.toUpperCase() === 'RESPONSABLE';
        const isTeamResponsible =
          Number(team.responsable) === authenticatedUser.id;

        setTeamId(team.id);
        setIsResponsible(roleIsResponsible || isTeamResponsible);
      } catch {
        setTeamId(null);
        setIsResponsible(false);
      } finally {
        setLoadingTeam(false);
      }
    };

    loadUserTeam();
  }, [authenticatedUser]);

  const canRegister = useMemo(() => {
    return (
      !!authenticatedUser &&
      !!teamId &&
      isResponsible &&
      tournamentStatus === 'INSCRIPTION_OUVERTE'
    );
  }, [authenticatedUser, teamId, isResponsible, tournamentStatus]);

  const register = async () => {
    if (!tournamentId || !teamId || !authenticatedUser?.token) {
      throw new Error("Impossible d'inscrire l'équipe");
    }

    setInscriptionLoading(true);
    try {
      await registerTeamToTournament(
        tournamentId,
        teamId,
        authenticatedUser.token,
      );
    } finally {
      setInscriptionLoading(false);
    }
  };

  return {
    canRegister,
    loadingTeam,
    inscriptionLoading,
    register,
  };
};

export { useUserInscription };
