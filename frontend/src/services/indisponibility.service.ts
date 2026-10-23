import { Indisponibility } from '../types';

const getAuthHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: token } : {}),
});

const getErrorMessage = async (response: Response, fallback: string) => {
  let raw = '';

  try {
    raw = await response.text();
  } catch {
    return fallback;
  }

  try {
    const data = JSON.parse(raw);
    if (data?.message) return data.message;
  } catch {
    // pas du JSON
  }

  if (raw.trim().length > 0) return raw;

  return fallback;
};

export const fetchIndisponibilities = async (
  userId: number,
  token: string,
): Promise<Indisponibility[]> => {
  const res = await fetch(`/api/indisponibilities?userId=${userId}`, {
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(
        res,
        'Impossible de récupérer les indisponibilités',
      ),
    );
  }

  return await res.json();
};

export const fetchIndisponibilityById = async (
  id: number,
  token: string,
): Promise<Indisponibility> => {
  const res = await fetch(`/api/indisponibilities/${id}`, {
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, 'Impossible de récupérer l’indisponibilité'),
    );
  }

  return await res.json();
};

export const createIndisponibility = async (
  userId: number,
  token: string,
  startDate: string,
  endDate: string,
): Promise<Indisponibility> => {
  const res = await fetch(`/api/indisponibilities?userId=${userId}`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ startDate, endDate }),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, 'Erreur lors de la création'));
  }

  return await res.json();
};

export const deleteIndisponibility = async (
  id: number,
  token: string,
): Promise<void> => {
  const res = await fetch(`/api/indisponibilities/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, 'Erreur lors de la suppression'),
    );
  }
};
