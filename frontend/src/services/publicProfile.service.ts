import { AuthenticatedUser } from '../types';

interface BackendSpeciality {
  id?: number;
  speciality: string;
}

export type PublicUser = {
  id: number;
  mail: string;
  password: string;
  token: string;
  tag: string;
  picture: string | { link: string };
  speciality: string;
  team?: number;
  createdAt?: string;
  role?: string;
};

export const getUserById = async (userId: string): Promise<PublicUser> => {
  const res = await fetch(`/api/auths/users/${userId}`);
  if (!res.ok) {
    throw new Error('Erreur récupération profil');
  }

  const data: AuthenticatedUser & {
    creationDate?: string;
    speciality?: BackendSpeciality;
  } = await res.json();

  const backendSpec = data.speciality as BackendSpeciality;

  return {
    ...data,
    speciality: backendSpec?.speciality ?? 'Aucune',
    picture: data.picture ?? '',
    createdAt: data.createdAt ?? data.creationDate,
  };
};

export const getTeamForUser = async (
  userId: string,
): Promise<{ name: string }> => {
  const res = await fetch(`/api/team/user/${userId}`);
  if (!res.ok) {
    throw new Error('Erreur récupération team');
  }

  return res.json();
};
