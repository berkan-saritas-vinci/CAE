import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useDemandesAdhesion } from './useDemandesAdhesion';
import * as adhesionService from '../services/adhesion.service';
import { getAuthenticatedUser } from '../utils/session';

vi.mock('../services/adhesion.service', () => ({
  getDemandesByTeamUserId: vi.fn(),
  accepterDemande: vi.fn(),
  refuserDemande: vi.fn(),
}));

vi.mock('../utils/session', () => ({
  getAuthenticatedUser: vi.fn(),
}));

describe('useDemandesAdhesion', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns undefined without authenticated user', () => {
    (getAuthenticatedUser as ReturnType<typeof vi.fn>).mockReturnValue(
      undefined,
    );

    const { result } = renderHook(() => useDemandesAdhesion());

    expect(result.current).toBeUndefined();
  });

  test('loads requests on mount', async () => {
    const demandes = [
      {
        id: 1,
        statut: 'EN_ATTENTE',
        user: { id: 20, mail: 'u@mail.com' },
        team: { id: 2, name: 'T1' },
      },
    ];

    (getAuthenticatedUser as ReturnType<typeof vi.fn>).mockReturnValue({
      id: 10,
      token: 'token-10',
    });
    (
      adhesionService.getDemandesByTeamUserId as ReturnType<typeof vi.fn>
    ).mockResolvedValue(demandes);

    const { result } = renderHook(() => useDemandesAdhesion());

    await waitFor(() => {
      expect(result.current?.loading).toBe(false);
    });

    expect(adhesionService.getDemandesByTeamUserId).toHaveBeenCalledWith(
      10,
      'token-10',
    );
    expect(result.current?.demandes).toEqual(demandes);
  });

  test('handleAccepter updates local status', async () => {
    const demandes = [
      {
        id: 1,
        statut: 'EN_ATTENTE',
        user: { id: 20, mail: 'u@mail.com' },
        team: { id: 2, name: 'T1' },
      },
    ];

    (getAuthenticatedUser as ReturnType<typeof vi.fn>).mockReturnValue({
      id: 10,
      token: 'token-10',
    });
    (
      adhesionService.getDemandesByTeamUserId as ReturnType<typeof vi.fn>
    ).mockResolvedValue(demandes);
    (
      adhesionService.accepterDemande as ReturnType<typeof vi.fn>
    ).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDemandesAdhesion());

    await waitFor(() => {
      expect(result.current?.loading).toBe(false);
    });

    await act(async () => {
      await result.current?.handleAccepter(1);
    });

    expect(result.current?.demandes[0].statut).toBe('ACCEPTEE');
  });
});
