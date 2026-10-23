import { useEffect, useMemo, useState } from 'react';
import { getMatchById } from '../services/match.service';
import {
  getSelectionsByMatch,
  setSelection,
  deleteSelection,
} from '../services/selection.service';
import {
  getTeamByUserId,
  getTeamMembers,
  isResponsable,
} from '../services/team.service';
import { fetchIndisponibilities } from '../services/indisponibility.service';
import { getAuthenticatedUser } from '../utils/session';
import type { Match, TeamMember, Selection } from '../types';

const MAX_SELECTIONS = 4;

type FeedbackType = 'success' | 'error';

type UseSelectionMatchResult = {
  isLoading: boolean;
  teamId: number | null;
  match: Match | null;
  team1Data: {
    id: number | null;
    name: string;
    members: TeamMember[];
    selections: Selection[];
  };
  team2Data: {
    id: number | null;
    name: string;
    members: TeamMember[];
    selections: Selection[];
  };
  message: string;
  messageType: FeedbackType;
  selectedMemberId: string;
  availableMembers: TeamMember[];
  matchSelections: Selection[];
  maxSelections: number;
  setSelectedMemberId: (memberId: string) => void;
  clearMessage: () => void;
  handleAddMember: () => Promise<void>;
  handleRemoveMember: (userId: number) => Promise<void>;
};

export function useSelectionMatch(
  matchIdParam?: string,
): UseSelectionMatchResult | undefined {
  const parsedMatchId = Number(matchIdParam);
  const user = getAuthenticatedUser();
  const token = user?.token;

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [team1Members, setTeam1Members] = useState<TeamMember[]>([]);
  const [team2Members, setTeam2Members] = useState<TeamMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<FeedbackType>('error');
  const [matchSelections, setMatchSelections] = useState<Selection[]>([]);
  const [matchDate, setMatchDate] = useState<Date | null>(null);
  const [unavailableMemberIds, setUnavailableMemberIds] = useState<number[]>(
    [],
  );
  const [matchAdministratorId, setMatchAdministratorId] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.token) {
        setMessage('Utilisateur non authentifié.');
        setMessageType('error');
        setIsLoading(false);
        return;
      }

      if (Number.isNaN(parsedMatchId)) {
        setMessage('Identifiant du match invalide.');
        setMessageType('error');
        setIsLoading(false);
        return;
      }

      const matchData: Match | null = await getMatchById(parsedMatchId);
      if (!matchData) {
        setMessage('Match introuvable.');
        setMessageType('error');
        setIsLoading(false);
        return;
      }

      setMatch(matchData);
      setMatchDate(new Date(matchData.dateTime));
      setMatchAdministratorId(matchData.administrator?.id ?? null);

      const currentTeam = await getTeamByUserId(user.id, user.token);
      if (!currentTeam) {
        setMessage('Aucune équipe trouvée pour cet utilisateur.');
        setMessageType('error');
        setIsLoading(false);
        return;
      }

      const isMatchTeam =
        currentTeam.id === matchData.team1?.id ||
        currentTeam.id === matchData.team2?.id;

      if (
        !isMatchTeam ||
        !(await isResponsable(currentTeam.name, user.id, user.token))
      ) {
        setMessage(
          "Vous n'êtes pas responsable d'une des équipes de ce match.",
        );
        setMessageType('error');
        setIsLoading(false);
        return;
      }

      const fetchedMembers = await getTeamMembers(currentTeam.id, user.token);
      setTeamId(currentTeam.id);
      setMembers(fetchedMembers ?? []);

      // Charger les données des deux équipes du match
      if (matchData.team1?.id) {
        const team1MembersData = await getTeamMembers(
          matchData.team1.id,
          user.token,
        );
        setTeam1Members(team1MembersData ?? []);
      }

      if (matchData.team2?.id) {
        const team2MembersData = await getTeamMembers(
          matchData.team2.id,
          user.token,
        );
        setTeam2Members(team2MembersData ?? []);
      }

      setIsLoading(false);
    };

    loadData();
  }, [parsedMatchId, user?.id, user?.token]);

  useEffect(() => {
    const refreshSelections = async () => {
      if (Number.isNaN(parsedMatchId)) {
        setMatchSelections([]);
        return;
      }

      const selections = await getSelectionsByMatch(parsedMatchId, token);
      setMatchSelections(selections ?? []);
    };

    refreshSelections();
  }, [parsedMatchId, token]);

  useEffect(() => {
    const loadUnavailableMembers = async () => {
      if (!user?.token || members.length === 0 || !matchDate) {
        setUnavailableMemberIds([]);
        return;
      }

      const matchTimestamp = matchDate.getTime();
      const unavailableIds = await Promise.all(
        members.map(async (member) => {
          try {
            // récupération des indisponibilitées de chaque membre
            const periods = await fetchIndisponibilities(member.id, user.token);
            // vérification pour chaque indisponibilitées du membre se trouve durant le match
            const isUnavailable = periods.some((period) => {
              const start = new Date(period.startDate).getTime();
              const end = new Date(period.endDate).getTime();
              if (Number.isNaN(start) || Number.isNaN(end)) return false;
              return start <= matchTimestamp && matchTimestamp <= end;
            });
            // on garde l'id du membre si indisponible
            return isUnavailable ? member.id : null;
          } catch {
            return null;
          }
        }),
      );

      setUnavailableMemberIds(
        unavailableIds.filter((id): id is number => id !== null),
      );
    };

    loadUnavailableMembers();
  }, [matchDate, members, user?.token]);

  const availableMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          !matchSelections.some(
            (selection) => selection.user?.id === member.id,
          ) &&
          !unavailableMemberIds.includes(member.id) &&
          member.id !== matchAdministratorId,
      ),
    [members, matchSelections, unavailableMemberIds, matchAdministratorId],
  );

  useEffect(() => {
    if (availableMembers.length === 0) {
      setSelectedMemberId('');
      return;
    }

    const currentSelectionIsAvailable = availableMembers.some(
      (member) => String(member.id) === selectedMemberId,
    );

    if (!currentSelectionIsAvailable) {
      setSelectedMemberId(String(availableMembers[0].id));
    }
  }, [availableMembers, selectedMemberId]);

  const refreshSelections = async () => {
    if (Number.isNaN(parsedMatchId)) {
      setMatchSelections([]);
      return;
    }

    const selections = await getSelectionsByMatch(parsedMatchId, token);
    setMatchSelections(selections ?? []);
  };

  const handleAddMember = async () => {
    setMessage('');

    if (!selectedMemberId) {
      setMessage('Sélection incomplète');
      setMessageType('error');
      return;
    }

    // Déterminer les sélections de l'équipe actuelle
    const currentTeamSelections =
      teamId === match?.team1?.id ? team1Selections : team2Selections;

    if (currentTeamSelections.length >= MAX_SELECTIONS) {
      setMessage(`Vous avez déjà sélectionné ${MAX_SELECTIONS} membres`);
      setMessageType('error');
      return;
    }

    const selectedMember = members.find(
      (member) => member.id === Number(selectedMemberId),
    );

    if (!selectedMember) {
      setMessage('Membre introuvable');
      setMessageType('error');
      return;
    }

    if (
      matchSelections.some(
        (selection) => selection.user?.id === selectedMember.id,
      )
    ) {
      setMessage('Ce membre est déjà sélectionné');
      setMessageType('error');
      return;
    }

    if (!teamId) {
      setMessage('Équipe introuvable');
      setMessageType('error');
      return;
    }

    const result = await setSelection(
      parsedMatchId,
      teamId,
      selectedMember.id,
      token,
    );
    if (!result) {
      setMessage("Impossible d'ajouter le membre");
      setMessageType('error');
      return;
    }

    await refreshSelections();
    setMessage('Membre ajouté avec succès');
    setMessageType('success');
  };

  const handleRemoveMember = async (userId: number) => {
    setMessage('');

    if (!teamId) {
      setMessage('Équipe introuvable');
      setMessageType('error');
      return;
    }

    const result = await deleteSelection(parsedMatchId, teamId, userId, token);
    if (!result) {
      setMessage('Impossible de supprimer le membre');
      setMessageType('error');
      return;
    }

    await refreshSelections();
    setMessage('Membre supprimé avec succès');
    setMessageType('success');
  };

  // Organiser les sélections par équipe
  const team1Selections = useMemo(
    () =>
      matchSelections.filter((selection) =>
        team1Members.some((member) => member.id === selection.user?.id),
      ),
    [matchSelections, team1Members],
  );

  const team2Selections = useMemo(
    () =>
      matchSelections.filter((selection) =>
        team2Members.some((member) => member.id === selection.user?.id),
      ),
    [matchSelections, team2Members],
  );

  return {
    isLoading,
    teamId,
    match,
    team1Data: {
      id: match?.team1?.id ?? null,
      name: match?.team1?.name ?? '',
      members: team1Members,
      selections: team1Selections,
    },
    team2Data: {
      id: match?.team2?.id ?? null,
      name: match?.team2?.name ?? '',
      members: team2Members,
      selections: team2Selections,
    },
    message,
    messageType,
    selectedMemberId,
    availableMembers,
    matchSelections,
    maxSelections: MAX_SELECTIONS,
    setSelectedMemberId,
    clearMessage: () => setMessage(''),
    handleAddMember,
    handleRemoveMember,
  };
}
