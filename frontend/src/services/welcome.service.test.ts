import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getTeamsWithMembers,
  envoyerDemandeWelcome,
  annulerDemandeWelcome,
  createTeamWelcome,
} from './welcome.service';

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = vi.fn() as unknown as typeof fetch;
});

const mockResponse = (data: object | null, ok = true) => ({
  ok,
  json: async () => data,
});

describe('getTeamsWithMembers', () => {
  it('retourne la liste des teams si la réponse est ok', async () => {
    const teams = [
      { id: 1, name: 'Twice' },
      { id: 2, name: 'Aespa' },
    ];
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(teams));

    const result = await getTeamsWithMembers();

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/team/with-members');
    expect(result).toEqual(teams);
  });

  it('lance une erreur si la réponse est ko', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    await expect(getTeamsWithMembers()).rejects.toThrow(
      'Erreur récupération teams',
    );
  });
});

describe('envoyerDemandeWelcome', () => {
  it('appelle la bonne URL', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null));

    await envoyerDemandeWelcome(1, 2);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/adhesions/1?userId=2', {
      method: 'POST',
    });
  });

  it('lance une erreur si la réponse est ko', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    await expect(envoyerDemandeWelcome(1, 2)).rejects.toThrow(
      'Erreur envoi demande',
    );
  });
});

describe('annulerDemandeWelcome', () => {
  it('appelle la bonne URL', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null));

    await annulerDemandeWelcome(1, 2);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/adhesions/1?userId=2', {
      method: 'DELETE',
    });
  });

  it('lance une erreur si la réponse est ko', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    await expect(annulerDemandeWelcome(1, 2)).rejects.toThrow(
      'Erreur annulation demande',
    );
  });
});

describe('createTeamWelcome', () => {
  it('retourne la team créée si la réponse est ok', async () => {
    const team = { id: 1, name: 'Twice', responsable: 42 };
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(team));

    const result = await createTeamWelcome('Twice', 42);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Twice', responsable: 42 }),
    });
    expect(result).toEqual(team);
  });

  it('lance une erreur si la réponse est ko', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    await expect(createTeamWelcome('Twice', 42)).rejects.toThrow(
      'Erreur création team',
    );
  });
});
