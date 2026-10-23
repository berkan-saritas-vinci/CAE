import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useUserInscription } from './useInscription';
import {
  getTeamByUserId,
  registerTeamToTournament,
} from '../services/tournaments/tournamentInscription.service';

vi.mock('../services/tournaments/tournamentInscription.service', () => ({
  getTeamByUserId: vi.fn(),
  registerTeamToTournament: vi.fn(),
}));

describe('useUserInscription', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('canRegister becomes true for a responsible user', async () => {
    const authenticatedUser = {
      id: 7,
      mail: 'u@mail.com',
      password: 'pwd',
      token: 'token',
      tag: 'U7',
      picture: '',
      speciality: {},
      role: 'RESPONSABLE',
    };

    (getTeamByUserId as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 11,
      responsable: 7,
    });

    const { result } = renderHook(() =>
      useUserInscription({
        authenticatedUser,
        tournamentId: 20,
        tournamentStatus: 'INSCRIPTION_OUVERTE',
      }),
    );

    await waitFor(() => {
      expect(result.current.loadingTeam).toBe(false);
    });

    expect(result.current.canRegister).toBe(true);
  });

  test('register throws when required data is missing', async () => {
    const { result } = renderHook(() =>
      useUserInscription({
        authenticatedUser: undefined,
        tournamentId: undefined,
        tournamentStatus: 'INSCRIPTION_OUVERTE',
      }),
    );

    await expect(result.current.register()).rejects.toThrow(
      "Impossible d'inscrire l'équipe",
    );
  });

  test('register calls service with correct ids', async () => {
    const authenticatedUser = {
      id: 7,
      mail: 'u@mail.com',
      password: 'pwd',
      token: 'token',
      tag: 'U7',
      picture: '',
      speciality: {},
      role: 'RESPONSABLE',
    };

    (getTeamByUserId as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 11,
      responsable: 7,
    });
    (registerTeamToTournament as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );

    const { result } = renderHook(() =>
      useUserInscription({
        authenticatedUser,
        tournamentId: 20,
        tournamentStatus: 'INSCRIPTION_OUVERTE',
      }),
    );

    await waitFor(() => {
      expect(result.current.canRegister).toBe(true);
    });

    await act(async () => {
      await result.current.register();
    });

    expect(registerTeamToTournament).toHaveBeenCalledWith(20, 11, 'token');
  });
});
