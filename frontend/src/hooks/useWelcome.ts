import { useState, useEffect, useCallback } from 'react';
import { Team } from '../types';
import {
  getTeamsWithMembers,
  envoyerDemandeWelcome,
  annulerDemandeWelcome,
  createTeamWelcome,
} from '../services/welcome.service';

type View = 'home' | 'list-team' | 'create-team';

export function useWelcome(pendingUserId: number) {
  const [view, setView] = useState<View>('home');
  const [teams, setTeams] = useState<Team[]>([]);
  const [sentRequests, setSentRequests] = useState<number[]>([]);
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (view === 'list-team') {
      getTeamsWithMembers()
        .then((data) => setTeams(Array.isArray(data) ? data : []))
        .catch(() => setTeams([]));
    }
  }, [view]);

  const handleRequest = useCallback(
    async (teamId: number, teamName: string) => {
      const alreadySent = sentRequests.includes(teamId);
      try {
        if (alreadySent) {
          await annulerDemandeWelcome(teamId, pendingUserId);
          setSentRequests((prev) => prev.filter((id) => id !== teamId));
          alert('Demande annulée pour la team : ' + teamName);
        } else {
          await envoyerDemandeWelcome(teamId, pendingUserId);
          setSentRequests((prev) => [...prev, teamId]);
          alert('Demande envoyée à la team : ' + teamName);
        }
      } catch {
        alert('Impossible de traiter la demande, réessayez.');
      }
    },
    [pendingUserId, sentRequests],
  );

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setError('Le nom est obligatoire');
      return;
    }
    try {
      await createTeamWelcome(teamName, pendingUserId);
      setSuccess(true);
      setTimeout(() => {
        sessionStorage.removeItem('pendingUser');
        window.location.href = '/Login';
      }, 2000);
    } catch {
      setError('Impossible de créer la team, réessayez.');
    }
  };

  return {
    view,
    setView,
    teams,
    sentRequests,
    teamName,
    setTeamName,
    error,
    setError,
    success,
    handleRequest,
    handleCreateTeam,
  };
}
