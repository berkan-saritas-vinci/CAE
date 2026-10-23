import { beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSelectionMatch } from './useSelectionMatch';
import * as matchService from '../services/match.service';
import * as selectionService from '../services/selection.service';
import * as teamService from '../services/team.service';
import * as indispoService from '../services/indisponibility.service';

vi.mock('../services/match.service', () => ({
  getMatchById: vi.fn(),
}));

vi.mock('../services/selection.service', () => ({
  getSelectionsByMatch: vi.fn(),
  setSelection: vi.fn(),
  deleteSelection: vi.fn(),
}));

vi.mock('../services/team.service', () => ({
  getTeamByUserId: vi.fn(),
  getTeamMembers: vi.fn(),
  isResponsable: vi.fn(),
}));

vi.mock('../services/indisponibility.service', () => ({
  fetchIndisponibilities: vi.fn(),
}));

const authenticatedUser = {
  id: 1,
  token: 'test-token',
};

describe('useSelectionMatch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  test('affiche une erreur si l utilisateur n est pas authentifié', async () => {
    const { result } = renderHook(() => useSelectionMatch('1'));

    await waitFor(() => {
      expect(result.current?.isLoading).toBe(false);
    });

    const hookResult = result.current!;
    expect(hookResult.message).toBe('Utilisateur non authentifié.');
    expect(hookResult.teamId).toBeNull();
  });

  test('charge les selections et les membres disponibles pour un match valide', async () => {
    localStorage.setItem(
      'authenticatedUser',
      JSON.stringify(authenticatedUser),
    );

    (
      matchService.getMatchById as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      id: 2,
      dateTime: '2026-04-25T10:00:00',
      team1: { id: 1 },
      team2: { id: 3 },
    });

    (
      teamService.getTeamByUserId as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      id: 1,
      name: 'Test Team',
    });

    (
      teamService.isResponsable as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(true);
    (
      teamService.getTeamMembers as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce([
      { id: 11, tag: 'Alice', mail: 'alice@test.com' },
      { id: 12, tag: 'Bob', mail: 'bob@test.com' },
    ]);

    (
      selectionService.getSelectionsByMatch as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce([{ id: 101, user: { id: 11, tag: 'Alice' } }]);

    (
      indispoService.fetchIndisponibilities as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);

    const { result } = renderHook(() => useSelectionMatch('2'));

    await waitFor(() => {
      expect(result.current?.isLoading).toBe(false);
    });

    const hookResult = result.current!;
    expect(hookResult.teamId).toBe(1);
    expect(hookResult.matchSelections).toEqual([
      { id: 101, user: { id: 11, tag: 'Alice' } },
    ]);
    expect(hookResult.availableMembers).toEqual([
      { id: 12, tag: 'Bob', mail: 'bob@test.com' },
    ]);
    expect(hookResult.message).toBe('');
  });
});
