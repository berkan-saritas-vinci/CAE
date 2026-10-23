import { useState, useEffect, useCallback } from 'react';
import { Team } from '../types';
import {
  getTeamsWithMembers,
  envoyerDemande,
  annulerDemande,
} from '../services/team.service';

export function useTeamsList(userId: number | undefined) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [sentRequests, setSentRequests] = useState<number[]>([]);

  useEffect(() => {
    getTeamsWithMembers()
      .then((data) => setTeams(Array.isArray(data) ? data : []))
      .catch(() => setTeams([]));
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/adhesions/user/${userId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((demandes) => {
        const ids = demandes
          .filter((d: { statut: string }) => d.statut === 'EN_ATTENTE')
          .map((d: { team: { id: number } }) => d.team.id);
        setSentRequests(ids);
      })
      .catch(() => {});
  }, [userId]);

  const handleRequest = useCallback(
    async (teamId: number, teamName: string) => {
      if (!userId) {
        alert('Vous devez être connecté pour envoyer une demande.');
        return;
      }
      const alreadySent = sentRequests.includes(teamId);
      try {
        if (alreadySent) {
          await annulerDemande(teamId, userId);
          setSentRequests(sentRequests.filter((id) => id !== teamId));
          alert('Demande annulée pour la team : ' + teamName);
        } else {
          await envoyerDemande(teamId, userId);
          setSentRequests([...sentRequests, teamId]);
          alert('Demande envoyée à la team : ' + teamName);
        }
      } catch {
        alert('Impossible de traiter la demande, réessayez.');
      }
    },
    [userId, sentRequests],
  );

  return { teams, sentRequests, handleRequest };
}
