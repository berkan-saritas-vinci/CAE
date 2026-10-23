import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getDemandesByTeamUserId,
  accepterDemande,
  refuserDemande,
} from './adhesion.service';

vi.mock('./profile.service', () => ({
  getAuthHeaders: (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: token,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = vi.fn() as unknown as typeof fetch;
});

const mockResponse = (data: object | null, ok = true) => ({
  ok,
  json: async () => data,
});

describe('getDemandesByTeamUserId', () => {
  it('retourne les demandes si les deux fetch sont ok', async () => {
    const team = { id: 1, name: 'Twice' };
    const demandes = [{ id: 1, statut: 'EN_ATTENTE' }];

    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(mockResponse(team))
      .mockResolvedValueOnce(mockResponse(demandes));

    const result = await getDemandesByTeamUserId(1, 'test-token');

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/team/user/1', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'test-token',
      },
    });
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/adhesions/team/1', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'test-token',
      },
    });
    expect(result).toEqual(demandes);
  });

  it('lance une erreur si le fetch de la team échoue', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    await expect(getDemandesByTeamUserId(1, 'test-token')).rejects.toThrow(
      'Équipe introuvable',
    );
  });

  it('lance une erreur si le fetch des demandes échoue', async () => {
    const team = { id: 1, name: 'Twice' };

    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(mockResponse(team))
      .mockResolvedValueOnce(mockResponse(null, false));

    await expect(getDemandesByTeamUserId(1, 'test-token')).rejects.toThrow(
      'Erreur lors du chargement des demandes',
    );
  });
});

describe('accepterDemande', () => {
  it('appelle la bonne URL avec le bon token', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null));

    await accepterDemande(1, 'test-token');

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/adhesions/1/accepter', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'test-token',
      },
    });
  });

  it('lance une erreur si la réponse est ko', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    await expect(accepterDemande(1, 'test-token')).rejects.toThrow(
      "Erreur lors de l'acceptation",
    );
  });
});

describe('refuserDemande', () => {
  it('appelle la bonne URL avec le motif encodé et le bon token', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null));

    await refuserDemande(1, 'Équipe complète', 'test-token');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `/api/adhesions/1/refuser?motif=${encodeURIComponent('Équipe complète')}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'test-token',
        },
      },
    );
  });

  it('lance une erreur si la réponse est ko', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    await expect(refuserDemande(1, 'motif', 'test-token')).rejects.toThrow(
      'Erreur lors du refus',
    );
  });
});
