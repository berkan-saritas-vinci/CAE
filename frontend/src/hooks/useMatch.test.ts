import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useMatch } from './useMatch';
import * as matchService from '../services/match.service';
import { getAuthenticatedUser } from '../utils/session';

vi.mock('../services/match.service', () => ({
  getMatchByTournament: vi.fn(),
  encodeResult: vi.fn(),
  teamValidate: vi.fn(),
  teamContest: vi.fn(),
}));

vi.mock('../utils/session', () => ({
  getAuthenticatedUser: vi.fn(),
}));

describe('useMatch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('charge les matchs quand l utilisateur est authentifié', async () => {
    (getAuthenticatedUser as ReturnType<typeof vi.fn>).mockReturnValue({
      id: 42,
      token: 'token-42',
    });
    (
      matchService.getMatchByTournament as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      { id: 1, homeTeam: { id: 10 }, awayTeam: { id: 20 } },
    ]);

    const { result } = renderHook(() => useMatch(5, 'token-42'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(matchService.getMatchByTournament).toHaveBeenCalledWith(5, 42);
    expect(result.current.matches).toEqual([
      { id: 1, homeTeam: { id: 10 }, awayTeam: { id: 20 } },
    ]);
    expect(result.current.error).toBeNull();
  });

  it('met à jour un match après adminEncode', async () => {
    (getAuthenticatedUser as ReturnType<typeof vi.fn>).mockReturnValue({
      id: 42,
      token: 'token-42',
    });
    (
      matchService.getMatchByTournament as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      { id: 2, homeTeam: { id: 10 }, awayTeam: { id: 20 }, score: '1-0' },
    ]);
    const updatedMatch = {
      id: 2,
      homeTeam: { id: 10 },
      awayTeam: { id: 20 },
      score: '2-0',
    };
    (matchService.encodeResult as ReturnType<typeof vi.fn>).mockResolvedValue(
      updatedMatch,
    );

    const { result } = renderHook(() => useMatch(5, 'token-42'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.adminEncode(2, { resultTeam1: 2, resultTeam2: 0 });
    });

    expect(matchService.encodeResult).toHaveBeenCalledWith(
      2,
      { resultTeam1: 2, resultTeam2: 0 },
      'token-42',
    );
    expect(result.current.matches).toEqual([updatedMatch]);
  });
});
