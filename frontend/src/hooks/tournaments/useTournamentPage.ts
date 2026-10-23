import { useEffect, useMemo, useState } from 'react';
import { LoginContext, TeamResponse, Tournament } from '../../types';
import { getTournamentsById } from '../../services/tournaments/tournament.service';
import {
  getTeamByUserId,
  getTeamsByTournamentId,
} from '../../services/tournaments/tournamentInscription.service';

type StatusColor = { bg: string; color: string };

const STATUS_COLORS: Record<string, StatusColor> = {
  INSCRIPTION_OUVERTE: { bg: '#e8f5e9', color: '#2e7d32' },
  EN_COURS: { bg: '#e3f2fd', color: '#1565c0' },
  TERMINE: { bg: '#eeeeee', color: '#616161' },
  A_VENIR: { bg: '#fff3e0', color: '#ef6c00' },
};

export const useTournamentPage = (
  tournamentId: string | undefined,
  authenticatedUser?: LoginContext['authenticatedUser'],
) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [isTeamResponsible, setIsTeamResponsible] = useState(false);

  useEffect(() => {
    const fetchTournament = async () => {
      if (!tournamentId) return;

      try {
        const parsedId = Number(tournamentId);
        const [data, teamsData] = await Promise.all([
          getTournamentsById(parsedId),
          getTeamsByTournamentId(parsedId),
        ]);
        setTournament(data);
        setTeams(teamsData);
      } catch (error) {
        console.error(error);
        setTournament(null);
        setTeams([]);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  useEffect(() => {
    const checkTeamResponsibility = async () => {
      if (!authenticatedUser?.id) {
        setIsTeamResponsible(false);
        return;
      }

      // Check if user has RESPONSABLE role
      if (authenticatedUser.role === 'RESPONSABLE') {
        setIsTeamResponsible(true);
        return;
      }

      try {
        const team = await getTeamByUserId(
          authenticatedUser.id,
          authenticatedUser.token,
        );
        const userIsTeamResponsible =
          Number(team.responsable) === authenticatedUser.id ||
          Number(team.secondResponsable) === authenticatedUser.id;

        setIsTeamResponsible(userIsTeamResponsible);
      } catch {
        setIsTeamResponsible(false);
      }
    };

    checkTeamResponsibility();
  }, [authenticatedUser]);

  const isRegistrationDeadlinePassed = (dateStr: string) =>
    new Date(dateStr).getTime() < Date.now();

  const registeredTeams = useMemo(
    () => tournament?.nbrTeamInscrite ?? teams.length,
    [tournament, teams.length],
  );

  return {
    tournament,
    teams,
    isTeamResponsible,
    isRegistrationDeadlinePassed,
    registeredTeams,
    statusColors: STATUS_COLORS,
  };
};
