import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  encodeResult,
  getMatchByTournament,
  teamContest,
  teamValidate,
} from './match.service';

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

const mockJsonResponse = (data: unknown, ok = true) => ({
  ok,
  json: async () => data,
  text: async () => JSON.stringify(data),
});

const mockTextResponse = (text: string, ok = true) => ({
  ok,
  json: async () => JSON.parse(text),
  text: async () => text,
});

describe('match.service', () => {
  it('getMatchByTournament retourne les matchs quand la réponse est ok', async () => {
    const data = [{ id: 7, name: 'Match 7' }];
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockJsonResponse(data));

    const result = await getMatchByTournament(3, 21);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/matches/3', {
      headers: {
        'Content-Type': 'application/json',
        userId: '21',
      },
    });
    expect(result).toEqual(data);
  });

  it('getMatchByTournament retourne null quand la réponse est ko', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockJsonResponse(null, false));

    const result = await getMatchByTournament(3, 21);

    expect(result).toBeNull();
  });

  it('encodeResult retourne le match mis à jour', async () => {
    const updatedMatch = { id: 5, score: '3-1' };
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockTextResponse(JSON.stringify(updatedMatch)));

    const result = await encodeResult(
      5,
      { homeScore: 3, awayScore: 1 } as Parameters<typeof encodeResult>[1],
      'tok',
    );

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/matches/5/results', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'tok',
      },
      body: JSON.stringify({ homeScore: 3, awayScore: 1 }),
    });
    expect(result).toEqual(updatedMatch);
  });

  it('teamValidate envoie un PUT avec token', async () => {
    const updatedMatch = { id: 8, status: 'VALIDATED' };
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockJsonResponse(updatedMatch));

    const result = await teamValidate(8, 12, 'token-10');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/matches/validate/8/12',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'token-10',
        },
      },
    );
    expect(result).toEqual(updatedMatch);
  });

  it('teamContest envoie un PUT et retourne la réponse JSON', async () => {
    const updatedMatch = { id: 9, status: 'CONTESTED' };
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockJsonResponse(updatedMatch));

    const result = await teamContest(9, 14, 'token-11');

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/matches/contest/9/14', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'token-11',
      },
    });
    expect(result).toEqual(updatedMatch);
  });
});
