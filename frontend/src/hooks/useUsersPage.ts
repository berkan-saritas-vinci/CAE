import { useEffect, useState, useCallback, useMemo } from 'react';
import { Team } from '../types';
import {
  fetchAllUsers,
  fetchAllTeams,
  toggleUserRole,
  banUser,
} from '../services/usersPage.service';

export interface LocalUser {
  id: number;
  tag: string;
  picture: string | { link: string };
  role: 'USER' | 'ADMIN' | 'BANNED';
}

export interface UserWithTeam extends LocalUser {
  team?: { id: number } | null;
}

interface TeamWithCount extends Team {
  memberCount: number;
}

export const useUsersPage = (token?: string) => {
  const [users, setUsers] = useState<UserWithTeam[]>([]);
  const [teams, setTeams] = useState<TeamWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTag, setSearchTag] = useState('');
  const [searchMode, setSearchMode] = useState<'USER' | 'TEAM'>('USER');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [userToBan, setUserToBan] = useState<LocalUser | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        if (searchMode === 'USER') {
          const data = await fetchAllUsers(token);
          setUsers(data as unknown as LocalUser[]);
        } else {
          const teamsData = await fetchAllTeams();
          const usersData = await fetchAllUsers(token);

          const usersWithTeam = usersData as unknown as UserWithTeam[];

          // Ajouter un champ "memberCount" à chaque team
          const teamsWithCount = teamsData.map((team) => ({
            ...team,
            memberCount: usersWithTeam.filter((u) => u.team?.id === team.id)
              .length,
          }));

          // Trier par nombre décroissant
          teamsWithCount.sort((a, b) => b.memberCount - a.memberCount);

          setTeams(teamsWithCount);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erreur récupération profil';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [searchMode, token]);

  // ---------------------- Actions sur les utilisateurs -----------------------

  const handleBan = useCallback(
    async (user: LocalUser) => {
      try {
        const updated = await banUser(user.id, token);
        setUsers(
          (prev) =>
            prev.map((u) => (u.id === user.id ? updated : u)) as LocalUser[],
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erreur récupération profil';
        setError(message);
      } finally {
        setUserToBan(null);
      }
    },
    [token],
  );

  const handleToggleRole = useCallback(
    async (user: LocalUser) => {
      try {
        setUpdatingUserId(user.id);
        const updated = await toggleUserRole(user.id, token);
        setUsers(
          (prev) =>
            prev.map((u) => (u.id === user.id ? updated : u)) as LocalUser[],
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erreur récupération profil';
        setError(message);
      } finally {
        setUpdatingUserId(null);
      }
    },
    [token],
  );

  const getUserTagById = useCallback(
    (id: number) => {
      const user = users.find((u) => u.id === id);
      return user ? user.tag : 'Inconnu';
    },
    [users],
  );

  // ------------------- FILTRE ----------------------

  const filteredUsers = useMemo(
    () =>
      users.filter((u) =>
        u.tag.toLowerCase().includes(searchTag.toLowerCase()),
      ),
    [users, searchTag],
  );

  const filteredTeams = useMemo(
    () =>
      teams
        .filter((t) => t.name.toLowerCase().includes(searchTag.toLowerCase()))
        .sort((a, b) => (b.memberCount ?? 0) - (a.memberCount ?? 0)),
    [teams, searchTag],
  );

  return {
    users,
    teams,
    loading,
    error,
    searchTag,
    searchMode,
    updatingUserId,
    userToBan,
    filteredUsers,
    filteredTeams,
    setSearchTag,
    setSearchMode,
    setUserToBan,
    handleToggleRole,
    handleBan,
    getUserTagById,
  };
};
