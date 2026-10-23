import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMatchDetail } from './useMatchDetail';
import * as matchService from '../services/match.service';

vi.mock('../services/match.service', () => ({
  getMatchByTournament: vi.fn(),
}));

describe('useMatchDetail', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('charge le match correspondant au matchId', async () => {
    const match = {
      id: 2,
      tournament: 1,
      team1: { id: 10, name: 'A', responsable: '100' },
      team2: { id: 20, name: 'B', responsable: '200' },
      turn: 1,
      status: 'PLAYED',
      admin: 999,
      dateTime: '2026-06-01T10:00:00',
      resultTeam1: 2,
      resultTeam2: 1,
    };

    (
      matchService.getMatchByTournament as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce([match]);

    const authenticatedUser = {
      id: 5,
      mail: 'user@test.com',
      password: 'x',
      token: 'token',
      tag: 'user',
      picture: '',
      speciality: {},
    };

    const { result } = renderHook(() =>
      useMatchDetail(1, 2, authenticatedUser),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.match).toEqual(match);
    expect(result.current.formatDateTime(undefined)).toBe('Date inconnue');
    expect(result.current.displayedScore(match, true)).toBe('2 - 1');
  });

  it('affiche --- pour un match planifié', async () => {
    const match = {
      id: 3,
      tournament: 1,
      team1: { id: 10, name: 'A', responsable: '100' },
      team2: { id: 20, name: 'B', responsable: '200' },
      turn: 1,
      status: 'PLANNED',
      admin: 999,
      dateTime: '2026-06-01T10:00:00',
      resultTeam1: 0,
      resultTeam2: 0,
    };
    const { result } = renderHook(() => useMatchDetail(1, 3, undefined));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.displayedScore(match, false)).toBe('---');
  });
});
