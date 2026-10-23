export const getTeamsWithMembers = async () => {
  const res = await fetch('/api/team/with-members');
  if (!res.ok) throw new Error('Erreur récupération teams');
  return res.json();
};

export const envoyerDemandeWelcome = async (teamId: number, userId: number) => {
  const res = await fetch(`/api/adhesions/${teamId}?userId=${userId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Erreur envoi demande');
};

export const annulerDemandeWelcome = async (teamId: number, userId: number) => {
  const res = await fetch(`/api/adhesions/${teamId}?userId=${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erreur annulation demande');
};

export const createTeamWelcome = async (name: string, responsable: number) => {
  const res = await fetch('/api/team', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, responsable }),
  });
  if (!res.ok) throw new Error('Erreur création team');
  return res.json();
};
