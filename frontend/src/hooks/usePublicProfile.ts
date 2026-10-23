import { useCallback, useEffect, useState } from 'react';
import {
  getUserById,
  getTeamForUser,
  type PublicUser,
} from '../services/publicProfile.service';

export const usePublicProfile = (userId?: string) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [team, setTeam] = useState<string>('Aucune team');
  const [error, setError] = useState<string>('');

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getUserById(userId);
      setUser(data);
    } catch {
      setError('Erreur récupération profil');
    }
  }, [userId]);

  const fetchTeam = useCallback(async () => {
    if (!userId) return;
    try {
      const teamData = await getTeamForUser(userId);
      setTeam(teamData.name);
    } catch {
      setTeam('Aucune team');
    }
  }, [userId]);

  useEffect(() => {
    void fetchUser();
    void fetchTeam();
  }, [fetchUser, fetchTeam]);

  return { user, team, error };
};
