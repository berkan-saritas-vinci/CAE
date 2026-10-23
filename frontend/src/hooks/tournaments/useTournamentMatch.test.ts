import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useTournamentMatch } from './useTournamentMatch';
import { getTournamentMatches } from '../../services/tournaments/tournament.service';

vi.mock('../../services/tournaments/tournament.service', () => ({
  getTournamentMatches: vi.fn(),
  generateTournamentMatch: vi.fn(),
  initializeTeamMatch: vi.fn(),
}));

describe('useTournamentMatch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  test('loads matches on mount', async () => {
    const mockMatches = [
      { id: 1, turn: 1, status: 'PLANNED' },
      { id: 2, turn: 1, status: 'PLANNED' },
    ];
    (getTournamentMatches as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockMatches,
    );

    const { result } = renderHook(() => useTournamentMatch(123, 'fake-token'));

    expect(result.current.matches).toEqual([]);

    await waitFor(() => {
      expect(getTournamentMatches).toHaveBeenCalledWith(123, 'fake-token');
    });

    await waitFor(() => {
      expect(result.current.matches).toEqual(mockMatches);
    });
  });

  test('returns empty array when no matches found', async () => {
    (getTournamentMatches as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const { result } = renderHook(() => useTournamentMatch(456, 'token-123'));

    await waitFor(() => {
      expect(result.current.matches).toEqual([]);
    });
  });

  test('handles errors gracefully', async () => {
    (getTournamentMatches as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = renderHook(() => useTournamentMatch(123, 'fake-token'));

    await waitFor(() => {
      expect(result.current.matches).toEqual([]);
    });

    expect(console.error).toHaveBeenCalledWith(
      'Erreur lors de la récupération des matches du tournoi :',
      expect.any(Error),
    );
  });

  test('refetch updates matches', async () => {
    const initialMatches = [{ id: 1, turn: 1, status: 'PLANNED' }];
    const updatedMatches = [
      { id: 1, turn: 1, status: 'PLANNED' },
      { id: 2, turn: 2, status: 'PLANNED' },
    ];

    (getTournamentMatches as ReturnType<typeof vi.fn>).mockResolvedValue(
      initialMatches,
    );

    const { result } = renderHook(() => useTournamentMatch(123, 'fake-token'));

    await waitFor(() => {
      expect(result.current.matches).toHaveLength(1);
    });

    (getTournamentMatches as ReturnType<typeof vi.fn>).mockResolvedValue(
      updatedMatches,
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.matches).toHaveLength(2);
    });
  });

  test('refetches when tournamentId changes', async () => {
    const matchesForTournament123 = [{ id: 1, turn: 1, status: 'PLANNED' }];
    const matchesForTournament456 = [
      { id: 2, turn: 1, status: 'PLANNED' },
      { id: 3, turn: 2, status: 'PLANNED' },
    ];

    (getTournamentMatches as ReturnType<typeof vi.fn>).mockResolvedValue(
      matchesForTournament123,
    );

    const { rerender } = renderHook(
      ({ tournamentId, token }) => useTournamentMatch(tournamentId, token),
      {
        initialProps: { tournamentId: 123, token: 'token1' },
      },
    );

    await waitFor(() => {
      expect(getTournamentMatches).toHaveBeenCalledWith(123, 'token1');
    });

    (getTournamentMatches as ReturnType<typeof vi.fn>).mockResolvedValue(
      matchesForTournament456,
    );

    rerender({ tournamentId: 456, token: 'token1' });

    await waitFor(() => {
      expect(getTournamentMatches).toHaveBeenCalledWith(456, 'token1');
    });
  });

  test('refetches when token changes', async () => {
    (getTournamentMatches as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, turn: 1, status: 'PLANNED' },
    ]);

    const { rerender } = renderHook(
      ({ tournamentId, token }) => useTournamentMatch(tournamentId, token),
      {
        initialProps: { tournamentId: 123, token: 'token1' },
      },
    );

    await waitFor(() => {
      expect(getTournamentMatches).toHaveBeenCalledWith(123, 'token1');
    });

    rerender({ tournamentId: 123, token: 'token2' });

    await waitFor(() => {
      expect(getTournamentMatches).toHaveBeenCalledWith(123, 'token2');
    });
  });
});
