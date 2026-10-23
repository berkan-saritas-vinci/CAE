import { beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMyTournaments } from './useMyTournaments';
import { getInscriptionMatchesByUser } from '../../services/match.service';

vi.mock('../../services/match.service', () => ({
  getInscriptionMatchesByUser: vi.fn(),
}));

describe('useMyTournaments', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  test('returns an empty list when user is missing', async () => {
    const { result } = renderHook(() => useMyTournaments(undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tournaments).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(getInscriptionMatchesByUser).not.toHaveBeenCalled();
  });

  test('loads tournaments for user team', async () => {
    const authenticatedUser = {
      id: 1,
      mail: 'user@mail.com',
      password: 'secret',
      token: 'token',
      tag: 'Player',
      picture: '',
      speciality: {},
    };

    const tournament1 = {
      id: 10,
      nom: 'Tournoi A',
      description: 'Desc',
      date_debut: '2026-06-10T10:00:00',
      date_fin: '2026-06-12T10:00:00',
      date_fin_inscription: '2026-06-01T10:00:00',
      etat: 'INSCRIPTION_OUVERTE',
      nbrTeam: 8,
      nbrTeamInscrite: 4,
    };

    const tournament2 = {
      id: 11,
      nom: 'Tournoi B',
      description: 'Desc',
      date_debut: '2026-07-10T10:00:00',
      date_fin: '2026-07-12T10:00:00',
      date_fin_inscription: '2026-07-01T10:00:00',
      etat: 'INSCRIPTION_OUVERTE',
      nbrTeam: 8,
      nbrTeamInscrite: 4,
    };

    const matches = [
      {
        id: 1,
        tournament: tournament1,
      },
      {
        id: 2,
        tournament: tournament1,
      },
      {
        id: 3,
        tournament: tournament2,
      },
    ];

    (getInscriptionMatchesByUser as ReturnType<typeof vi.fn>).mockResolvedValue(
      matches,
    );

    const { result } = renderHook(() => useMyTournaments(authenticatedUser));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getInscriptionMatchesByUser).toHaveBeenCalledWith(1, 'token');
    expect(result.current.tournaments).toEqual([tournament1, tournament2]);
    expect(result.current.error).toBeNull();
  });

  test('returns error and empty list when loading fails', async () => {
    const authenticatedUser = {
      id: 2,
      mail: 'user2@mail.com',
      password: 'secret',
      token: 'token-2',
      tag: 'Player2',
      picture: '',
      speciality: {},
    };

    (getInscriptionMatchesByUser as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('BOOM'),
    );

    const { result } = renderHook(() => useMyTournaments(authenticatedUser));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tournaments).toEqual([]);
    expect(result.current.error).toBe('BOOM');
  });
});
