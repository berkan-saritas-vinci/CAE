import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  getTeamByUserId,
  registerTeamToTournament,
  getTeamsByTournamentId,
} from './tournamentInscription.service';

vi.mock('./profile.service', () => ({
  getAuthHeaders: (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: token,
  }),
}));

describe('tournamentInscription.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn() as unknown as typeof fetch;
  });

  test('getTeamByUserId returns the user team', async () => {
    const team = { id: 1, responsable: 10 };

    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => team,
    });

    const result = await getTeamByUserId(10, 'my-token');

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/team/user/10', {
      headers: {
        Authorization: 'Bearer my-token',
      },
    });
    expect(result).toEqual(team);
  });

  test('getTeamByUserId sends empty headers when token is omitted', async () => {
    const team = { id: 1, responsable: 10 };

    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => team,
    });

    const result = await getTeamByUserId(10);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/team/user/10', {
      headers: {},
    });
    expect(result).toEqual(team);
  });

  test('getTeamByUserId throws on failure', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
    });

    await expect(getTeamByUserId(10, 'my-token')).rejects.toThrow(
      'Impossible de récupérer la team utilisateur',
    );
  });

  test('registerTeamToTournament returns parsed JSON when backend sends text', async () => {
    const payload = { id: 99 };

    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(payload),
    });

    const result = await registerTeamToTournament(2, 3, 'my-token');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/inscriptiontournament/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'my-token',
        },
        body: JSON.stringify({
          tournament: { id: 2 },
          team: { id: 3 },
        }),
      },
    );
    expect(result).toEqual(payload);
  });

  test('registerTeamToTournament returns null when backend sends empty text', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      text: async () => '',
    });

    const result = await registerTeamToTournament(2, 3, 'my-token');

    expect(result).toBeNull();
  });

  test('registerTeamToTournament throws on failure', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
      text: async () => 'TEAM_ERROR',
    });

    await expect(registerTeamToTournament(2, 3, 'my-token')).rejects.toThrow(
      "Erreur lors de l'inscription au tournoi : TEAM_ERROR",
    );
  });

  test('getTeamsByTournamentId returns teams with token', async () => {
    const teams = [{ id: 1, name: 'A' }];

    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => teams,
    });

    const result = await getTeamsByTournamentId(4, 'my-token');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/inscriptiontournament/tournament/4/teams',
      {
        headers: {
          Authorization: 'Bearer my-token',
        },
      },
    );
    expect(result).toEqual(teams);
  });

  test('getTeamsByTournamentId returns teams without token', async () => {
    const teams = [{ id: 1, name: 'A' }];

    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => teams,
    });

    const result = await getTeamsByTournamentId(4);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/inscriptiontournament/tournament/4/teams',
      {
        headers: {},
      },
    );
    expect(result).toEqual(teams);
  });

  test('getTeamsByTournamentId throws on failure', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
    });

    await expect(getTeamsByTournamentId(4, 'my-token')).rejects.toThrow(
      'Impossible de récupérer les équipes du tournoi',
    );
  });
});
