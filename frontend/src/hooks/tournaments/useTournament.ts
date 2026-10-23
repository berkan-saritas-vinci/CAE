import { useEffect, useState } from 'react';
import { Tournament } from '../../types';
import { getTeamsByTournamentId } from '../../services/tournaments/tournamentInscription.service';
import {
  getAllTournaments,
  getTournamentsByStatus,
  getTournamentsByUserId,
} from '../../services/tournaments/tournament.service';
import { getUserByTag } from '../../services/usersPage.service';

type FilterType = 'STATUS' | 'PERIOD' | 'PLAYER' | 'TEAM';

const TOURNAMENT_STATUS_ORDER = [
  'A_VENIR',
  'INSCRIPTION_OUVERTE',
  'EN_COURS',
  'TERMINE',
];

const getStatusRank = (status: string) => {
  const rank = TOURNAMENT_STATUS_ORDER.indexOf(status);
  return rank === -1 ? TOURNAMENT_STATUS_ORDER.length : rank;
};

const fetchTournamentsByStatus = async (status: string) => {
  if (status === 'ALL') return getAllTournaments();
  return getTournamentsByStatus(status);
};

export const useTournaments = () => {
  const [filterType, setFilterType] = useState<FilterType>('STATUS');
  const [status, setStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [playerTag, setPlayerTag] = useState('');
  const [teamName, setTeamName] = useState('');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        let data: Tournament[] = [];

        //  statut
        if (filterType === 'STATUS') {
          data = await fetchTournamentsByStatus(status);
        } else {
          data = await fetchTournamentsByStatus('ALL');
        }

        data = data.filter((t) => t.etat !== 'SAUVEGARDE');

        //  période
        if (filterType === 'PERIOD') {
          data = data.filter((t) => {
            const start = new Date(t.date_debut).getTime();
            const from = startDate ? new Date(startDate).getTime() : 0;
            const to = endDate ? new Date(endDate).getTime() : Infinity;
            return start >= from && start <= to;
          });
        }

        const normalizeForSearch = (text: string) =>
          text
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .toLowerCase()
            .trim();

        //  équipe
        if (filterType === 'TEAM' && teamName.trim()) {
          const searchTerm = normalizeForSearch(teamName);
          const targetCount = Number.parseInt(teamName, 10);

          if (!Number.isNaN(targetCount)) {
            data = data.filter(
              (tournament) => (tournament.nbrTeamInscrite ?? 0) === targetCount,
            );
          } else {
            const tournamentsWithTeams = await Promise.all(
              data.map(async (tournament) => ({
                tournament,
                teams: await getTeamsByTournamentId(tournament.id),
              })),
            );

            data = tournamentsWithTeams
              .filter((item) =>
                item.teams.some((team) =>
                  normalizeForSearch(team.name || '').includes(searchTerm),
                ),
              )
              .map((item) => item.tournament);
          }
        }

        if (filterType === 'PLAYER' && playerTag.trim()) {
          try {
            const user = await getUserByTag(playerTag);
            data = await getTournamentsByUserId(user.id);
          } catch (error) {
            data = [];
          }
        }

        data.sort((a, b) => {
          const statusA = getStatusRank(a.etat);
          const statusB = getStatusRank(b.etat);

          if (statusA !== statusB) return statusA - statusB;

          return (
            new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime()
          );
        });

        setTournaments(data);
      } catch (error) {
        console.error('Erreur lors du chargement', error);
        setTournaments([]);
      }
    };

    fetchTournaments();
  }, [filterType, status, startDate, endDate, playerTag, teamName]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR');

  const isRegistrationDeadlinePassed = (dateStr: string) =>
    new Date(dateStr).getTime() < Date.now();

  return {
    filterType,
    setFilterType,
    status,
    setStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    playerTag,
    setPlayerTag,
    teamName,
    setTeamName,
    tournaments,
    formatDate,
    isRegistrationDeadlinePassed,
  };
};
