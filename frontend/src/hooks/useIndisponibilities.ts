import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LoginContext, Indisponibility } from '../types';
import {
  fetchIndisponibilities,
  createIndisponibility,
  deleteIndisponibility,
} from '../services/indisponibility.service';

export const useIndisponibilities = () => {
  const { authenticatedUser } = useOutletContext<LoginContext>();

  const userId = authenticatedUser?.id;
  const token = authenticatedUser?.token;

  const [periods, setPeriods] = useState<Indisponibility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPeriods = useCallback(async () => {
    if (!userId || !token) return;

    setLoading(true);
    try {
      const data = await fetchIndisponibilities(userId, token);
      // Trie la liste des périodes par ordre croissant des dates de début
      setPeriods(
        data.sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        ),
      );
      setError('');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erreur chargement indisponibilités';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    loadPeriods();
  }, [loadPeriods]);

  const addPeriod = useCallback(
    async (startDate: string, endDate: string) => {
      if (!userId || !token) throw new Error('Utilisateur non connecté');

      const created = await createIndisponibility(
        userId,
        token,
        startDate,
        endDate,
      );

      setPeriods((prev) =>
        [...prev, created].sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        ),
      );
    },
    [userId, token],
  );

  const removePeriod = useCallback(
    async (id: number) => {
      if (!token) throw new Error('Utilisateur non connecté');

      await deleteIndisponibility(id, token);

      setPeriods((prev) => prev.filter((p) => p.id !== id));
    },
    [token],
  );

  return {
    periods,
    loading,
    error,
    addPeriod,
    removePeriod,
    refresh: loadPeriods,
  };
};
