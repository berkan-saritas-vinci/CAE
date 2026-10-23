import { AuthenticatedUser } from '../types';

export type ProfileApiUser = AuthenticatedUser & { creationDate?: string };
export interface ProfilePicture {
  id: number;
  link: string;
}

export const getAuthHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: token } : {}),
});

const getErrorMessage = async (response: Response, fallback: string) => {
  try {
    const data = await response.json();
    if (data?.message) return data.message as string;
  } catch {
    const text = await response.text();
    if (text) return text;
  }
  return fallback;
};

export const fetchProfile = async (userId: number) => {
  const res = await fetch(`/api/auths/${userId}`);

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, 'Impossible de récupérer le profil'),
    );
  }

  return (await res.json()) as ProfileApiUser;
};

export const fetchUserTeam = async (userId: number) => {
  const response = await fetch(`/api/team/user/${userId}`);

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        'Erreur lors de la récupération de la team',
      ),
    );
  }

  return (await response.json()) as { id: number; name?: string };
};

export const fetchProfilePictures = async () => {
  const response = await fetch('/api/pictures/all');

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, 'Erreur lors du chargement des images'),
    );
  }

  return (await response.json()) as ProfilePicture[];
};

export const updateProfile = async (
  token: string,
  updates: Partial<Pick<AuthenticatedUser, 'speciality' | 'picture'>>,
) => {
  const response = await fetch('/api/auths/users/me', {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, 'Erreur lors de la sauvegarde du profil'),
    );
  }

  return (await response.json()) as Partial<AuthenticatedUser>;
};

export const updatePassword = async (
  token: string,
  oldPassword: string,
  newPassword: string,
) => {
  const response = await fetch('/api/auths/users/me/password', {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        'Erreur lors de la modification du mot de passe',
      ),
    );
  }
};
