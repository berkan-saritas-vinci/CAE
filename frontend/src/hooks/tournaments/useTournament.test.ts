import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useTournaments } from './useTournament';
import {
  getAllTournaments,
  getTournamentsByStatus,
} from '../../services/tournaments/tournament.service';

vi.mock('../../services/tournaments/tournamentInscription.service', () => ({
  getTeamsByTournamentId: vi.fn(),
}));

vi.mock('../../services/tournaments/tournament.service', () => ({
  getAllTournaments: vi.fn(),
  getTournamentsByStatus: vi.fn(),
}));

describe('useTournaments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  test('loads tournaments and removes saved ones', async () => {
    (getAllTournaments as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        id: 1,
        nom: 'Visible',
        description: 'Desc',
        date_debut: '2026-05-02T10:00:00',
        date_fin: '2026-05-03T10:00:00',
        date_fin_inscription: '2026-05-01T10:00:00',
        etat: 'A_VENIR',
        nbrTeam: 8,
        nbrTeamInscrite: 1,
      },
      {
        id: 2,
        nom: 'Cache',
        description: 'Desc',
        date_debut: '2026-05-01T10:00:00',
        date_fin: '2026-05-02T10:00:00',
        date_fin_inscription: '2026-04-29T10:00:00',
        etat: 'SAUVEGARDE',
        nbrTeam: 8,
        nbrTeamInscrite: 1,
      },
    ]);

    const { result } = renderHook(() => useTournaments());

    await waitFor(() => {
      expect(result.current.tournaments).toHaveLength(1);
    });

    expect(getAllTournaments).toHaveBeenCalled();
    expect(result.current.tournaments[0].id).toBe(1);
  });

  test('filters by status using the correct service call', async () => {
    (getAllTournaments as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);
    (getTournamentsByStatus as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      [],
    );

    const { result } = renderHook(() => useTournaments());

    await waitFor(() => {
      expect(getAllTournaments).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      result.current.setStatus('EN_COURS');
    });

    await waitFor(() => {
      expect(getTournamentsByStatus).toHaveBeenCalledWith('EN_COURS');
    });
  });

  test('filters team by nbrTeamInscrite when search is numeric', async () => {
    (getAllTournaments as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 10,
          nom: 'T1',
          description: 'Desc',
          date_debut: '2026-05-10T10:00:00',
          date_fin: '2026-05-11T10:00:00',
          date_fin_inscription: '2026-05-09T10:00:00',
          etat: 'A_VENIR',
          nbrTeam: 16,
          nbrTeamInscrite: 3,
        },
        {
          id: 11,
          nom: 'T2',
          description: 'Desc',
          date_debut: '2026-05-12T10:00:00',
          date_fin: '2026-05-13T10:00:00',
          date_fin_inscription: '2026-05-10T10:00:00',
          etat: 'A_VENIR',
          nbrTeam: 16,
          nbrTeamInscrite: 5,
        },
      ]);

    const { result } = renderHook(() => useTournaments());

    await waitFor(() => {
      expect(getAllTournaments).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      result.current.setFilterType('TEAM');
      result.current.setTeamName('5');
    });

    await waitFor(() => {
      expect(result.current.tournaments.map((t) => t.id)).toEqual([11]);
    });
  });
});
