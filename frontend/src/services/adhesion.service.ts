import { DemandeAdhesion } from '../types';
import { getAuthHeaders } from './profile.service';

export const getDemandesByTeamUserId = async (
  userId: number,
  token: string,
): Promise<DemandeAdhesion[]> => {
  const teamRes = await fetch(`/api/team/user/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  if (!teamRes.ok) throw new Error('Équipe introuvable');
  const team = await teamRes.json();

  const demandesRes = await fetch(`/api/adhesions/team/${team.id}`, {
    headers: getAuthHeaders(token),
  });
  if (!demandesRes.ok)
    throw new Error('Erreur lors du chargement des demandes');
  return demandesRes.json();
};

export const accepterDemande = async (
  id: number,
  token: string,
): Promise<void> => {
  const res = await fetch(`/api/adhesions/${id}/accepter`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur lors de l'acceptation");
};

export const refuserDemande = async (
  id: number,
  motif: string,
  token: string,
): Promise<void> => {
  const res = await fetch(
    `/api/adhesions/${id}/refuser?motif=${encodeURIComponent(motif)}`,
    { method: 'PUT', headers: getAuthHeaders(token) },
  );
  if (!res.ok) throw new Error('Erreur lors du refus');
};
