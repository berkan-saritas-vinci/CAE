import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  deleteSelection,
  getSelectionsByMatch,
  setSelection,
} from './selection.service';

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

describe('selection.service', () => {
  it('setSelection envoie un POST et retourne la réponse JSON', async () => {
    const selection = { id: 1, team: { id: 2 } };
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(selection));

    const result = await setSelection(5, 2, 7, 'token');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/inscriptionMatches?match=5&team.id=2&user.id=7',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'token',
        },
      },
    );
    expect(result).toEqual(selection);
  });

  it('setSelection renvoie null si la réponse est ko', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    const result = await setSelection(5, 2, 7, 'token');

    expect(result).toBeNull();
  });

  it('deleteSelection envoie un DELETE et retourne true si ok', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null));

    const result = await deleteSelection(5, 2, 7, 'token');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/inscriptionMatches?match=5&team.id=2&user.id=7',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'token',
        },
      },
    );
    expect(result).toBe(true);
  });

  it('deleteSelection renvoie false si la réponse est ko', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    const result = await deleteSelection(5, 2, 7, 'token');

    expect(result).toBe(false);
  });

  it('getSelectionsByMatch retourne un tableau vide si fetch échoue', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    const result = await getSelectionsByMatch(9, 'token');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/inscriptionMatches/match/9',
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'token',
        },
      },
    );
    expect(result).toEqual([]);
  });
});
