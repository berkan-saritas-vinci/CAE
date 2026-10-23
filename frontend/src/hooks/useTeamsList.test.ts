import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useTeamsList } from './useTeamsList';
import {
  getTeamsWithMembers,
  envoyerDemande,
  annulerDemande,
} from '../services/team.service';

vi.mock('../services/team.service', () => ({
  getTeamsWithMembers: vi.fn(),
  envoyerDemande: vi.fn(),
  annulerDemande: vi.fn(),
}));

describe('useTeamsList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('alert', vi.fn());
    globalThis.fetch = vi.fn() as unknown as typeof fetch;
  });

  test('loads teams on mount', async () => {
    (getTeamsWithMembers as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, name: 'A', responsable: '1' },
    ]);
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      {
        ok: true,
        json: async () => [],
      },
    );

    const { result } = renderHook(() => useTeamsList(7));

    await waitFor(() => {
      expect(result.current.teams).toHaveLength(1);
    });
  });

  test('loads pending requests for user', async () => {
    (getTeamsWithMembers as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      {
        ok: true,
        json: async () => [
          { statut: 'EN_ATTENTE', team: { id: 10 } },
          { statut: 'ACCEPTEE', team: { id: 99 } },
        ],
      },
    );

    const { result } = renderHook(() => useTeamsList(8));

    await waitFor(() => {
      expect(result.current.sentRequests).toEqual([10]);
    });
  });

  test('handleRequest sends a request', async () => {
    (getTeamsWithMembers as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      {
        ok: true,
        json: async () => [],
      },
    );
    (envoyerDemande as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const { result } = renderHook(() => useTeamsList(8));

    await waitFor(() => {
      expect(result.current.sentRequests).toEqual([]);
    });

    await act(async () => {
      await result.current.handleRequest(10, 'Team 10');
    });

    expect(envoyerDemande).toHaveBeenCalledWith(10, 8);
    expect(result.current.sentRequests).toEqual([10]);
  });

  test('handleRequest cancels an already sent request', async () => {
    (getTeamsWithMembers as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      {
        ok: true,
        json: async () => [{ statut: 'EN_ATTENTE', team: { id: 10 } }],
      },
    );
    (annulerDemande as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const { result } = renderHook(() => useTeamsList(8));

    await waitFor(() => {
      expect(result.current.sentRequests).toEqual([10]);
    });

    await act(async () => {
      await result.current.handleRequest(10, 'Team 10');
    });

    expect(annulerDemande).toHaveBeenCalledWith(10, 8);
    expect(result.current.sentRequests).toEqual([]);
  });
});
