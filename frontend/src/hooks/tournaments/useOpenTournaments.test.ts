import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useOpenTournaments } from './useOpenTournaments';
import {
  getTournamentsByStatus,
  getTeamRegisteredTournaments,
  registerTeamToTournament,
} from '../../services/tournaments/tournament.service';
import {
  getTeamByUserId,
  getTeamMembersCount,
} from '../../services/tournaments/tournamentInscription.service';

vi.mock('../../services/tournaments/tournament.service', () => ({
  getTournamentsByStatus: vi.fn(),
  getTeamRegisteredTournaments: vi.fn(),
  registerTeamToTournament: vi.fn(),
}));

vi.mock('../../services/tournaments/tournamentInscription.service', () => ({
  getTeamByUserId: vi.fn(),
  getTeamMembersCount: vi.fn().mockResolvedValue(4),
}));

describe('useOpenTournaments', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal('alert', vi.fn());
  });

  test('loads open tournaments on mount', async () => {
    const openTournaments = [
      {
        id: 1,
        nom: 'Open 1',
        description: 'Desc',
        date_debut: '2026-08-01T10:00:00',
        date_fin: '2026-08-03T10:00:00',
        date_fin_inscription: '2026-07-20T10:00:00',
        etat: 'INSCRIPTION_OUVERTE',
        nbrTeam: 8,
        nbrTeamInscrite: 2,
      },
    ];

    (getTournamentsByStatus as ReturnType<typeof vi.fn>).mockResolvedValue(
      openTournaments,
    );

    const { result } = renderHook(() => useOpenTournaments(undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getTournamentsByStatus).toHaveBeenCalledWith('INSCRIPTION_OUVERTE');
    expect(result.current.tournaments).toEqual(openTournaments);
    expect(result.current.registeredTournaments).toEqual([]);
  });

  test('loads user team and its registered tournaments', async () => {
    const authenticatedUser = {
      id: 5,
      mail: 'player@mail.com',
      password: 'pwd',
      token: 'token-5',
      tag: 'Player5',
      picture: '',
      speciality: {},
    };

    const registered = [
      {
        id: 2,
        nom: 'Inscrit',
        description: 'Desc',
        date_debut: '2026-09-01T10:00:00',
        date_fin: '2026-09-02T10:00:00',
        date_fin_inscription: '2026-08-20T10:00:00',
        etat: 'INSCRIPTION_OUVERTE',
        nbrTeam: 16,
        nbrTeamInscrite: 6,
      },
    ];

    (getTournamentsByStatus as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (getTeamByUserId as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 77,
      responsable: 5,
    });
    (getTeamMembersCount as ReturnType<typeof vi.fn>).mockResolvedValue(4);
    (
      getTeamRegisteredTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue(registered);

    const { result } = renderHook(() => useOpenTournaments(authenticatedUser));

    await waitFor(() => {
      expect(result.current.registeredTournaments).toEqual(registered);
    });

    expect(getTeamByUserId).toHaveBeenCalledWith(5, 'token-5');
    expect(getTeamRegisteredTournaments).toHaveBeenCalledWith(77);
  });

  test('handleRegister shows an error when user is missing', async () => {
    (getTournamentsByStatus as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const { result } = renderHook(() => useOpenTournaments(undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleRegister(10, 'token');
    });

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Impossible d'inscrire l'équipe : utilisateur introuvable",
    );
    expect(registerTeamToTournament).not.toHaveBeenCalled();
  });

  test('handleRegister registers team then refreshes lists', async () => {
    const authenticatedUser = {
      id: 9,
      mail: 'player9@mail.com',
      password: 'pwd',
      token: 'token-9',
      tag: 'P9',
      picture: '',
      speciality: {},
      team: 55,
    };

    const openTournaments = [
      {
        id: 12,
        nom: 'Open',
        description: 'Desc',
        date_debut: '2026-10-01T10:00:00',
        date_fin: '2026-10-02T10:00:00',
        date_fin_inscription: '2026-09-25T10:00:00',
        etat: 'INSCRIPTION_OUVERTE',
        nbrTeam: 8,
        nbrTeamInscrite: 2,
      },
    ];

    (getTournamentsByStatus as ReturnType<typeof vi.fn>).mockResolvedValue(
      openTournaments,
    );
    (
      getTeamRegisteredTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue(openTournaments);
    (getTeamByUserId as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 55,
      responsable: 9,
    });
    (getTeamMembersCount as ReturnType<typeof vi.fn>).mockResolvedValue(4);

    const { result } = renderHook(() => useOpenTournaments(authenticatedUser));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleRegister(12, 'token-9');
    });

    expect(registerTeamToTournament).toHaveBeenCalledWith(12, 55, 9, 'token-9');
    expect(globalThis.alert).toHaveBeenCalledWith(
      'Inscription au tournoi réussie !',
    );
    expect(getTeamRegisteredTournaments).toHaveBeenCalledWith(55);
  });
});
