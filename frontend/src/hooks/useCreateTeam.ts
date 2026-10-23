import { useState } from 'react';
import { NewTeam, Team } from '../types';
import { createTeam } from '../services/team.service';

export function useCreateTeam(
  userId: number | undefined,
  token: string | undefined,
) {
  const [teamName, setTeamName] = useState('');

  const handleSubmit = async (): Promise<Team> => {
    if (!teamName.trim()) throw new Error('Veuillez entrer un nom de team');
    if (!userId || !token) throw new Error('Utilisateur non connecté');

    const newTeam: NewTeam = { name: teamName, responsable: userId };
    return createTeam(newTeam);
  };

  return { teamName, setTeamName, handleSubmit };
}
