import { useEffect, useState } from 'react';
import { DemandeAdhesion } from '../types';
import * as adhesionService from '../services/adhesion.service';
import { getAuthenticatedUser } from '../utils/session';

export function useDemandesAdhesion() {
  const [demandes, setDemandes] = useState<DemandeAdhesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authenticatedUser = getAuthenticatedUser();

  useEffect(() => {
    if (!authenticatedUser?.token) return;
    if (authenticatedUser === undefined) return;
    if (authenticatedUser === null) {
      setLoading(false);
      return;
    }

    adhesionService
      .getDemandesByTeamUserId(authenticatedUser.id, authenticatedUser.token)
      .then((data) => {
        setDemandes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [authenticatedUser]);

  if (!authenticatedUser) {
    return;
  }

  const handleAccepter = async (id: number) => {
    await adhesionService.accepterDemande(id, authenticatedUser.token);
    setDemandes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, statut: 'ACCEPTEE' } : d)),
    );
  };

  const handleRefuser = async (id: number, motif: string) => {
    await adhesionService.refuserDemande(id, motif, authenticatedUser.token);
    setDemandes((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, statut: 'REFUSEE', motifRefus: motif } : d,
      ),
    );
  };

  return { demandes, loading, error, handleAccepter, handleRefuser };
}
