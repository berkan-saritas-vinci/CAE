import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  fetchIndisponibilities,
  fetchIndisponibilityById,
  createIndisponibility,
  deleteIndisponibility,
} from './indisponibility.service';
import { Indisponibility } from '../types';

describe('indisponibility.service', () => {
  const token = 'test-token';
  const userId = 3;

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn() as unknown as typeof fetch;
  });

  test('fetchIndisponibilities sends Authorization header when token is provided', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await fetchIndisponibilities(3, 'abc123');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/indisponibilities?userId=3',
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'abc123',
        },
      },
    );
  });

  test('fetchIndisponibilities does NOT send Authorization header when token is empty string', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await fetchIndisponibilities(3, '');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/indisponibilities?userId=3',
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  });

  test('fetchIndisponibilities handles missing token argument', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await fetchIndisponibilities(userId, undefined as unknown as string);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `/api/indisponibilities?userId=${userId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  });

  test('fetchIndisponibilities returns periods', async () => {
    const sample: Indisponibility[] = [
      { id: 1, startDate: '2025-01-01', endDate: '2025-01-05' },
    ];

    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => sample,
    });

    const result = await fetchIndisponibilities(userId, token);

    expect(result).toEqual(sample);
  });

  test('fetchIndisponibilityById returns a period', async () => {
    const sample: Indisponibility = {
      id: 10,
      startDate: '2025-01-01',
      endDate: '2025-01-02',
    };

    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => sample,
    });

    const result = await fetchIndisponibilityById(10, token);

    expect(result).toEqual(sample);
  });

  test('createIndisponibility returns created period when request succeeds', async () => {
    const created: Indisponibility = {
      id: 99,
      startDate: '2025-01-01',
      endDate: '2025-01-02',
    };

    const mockJson = vi.fn().mockResolvedValue(created);

    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: mockJson,
    });

    const result = await createIndisponibility(
      userId,
      token,
      '2025-01-01',
      '2025-01-02',
    );

    expect(mockJson).toHaveBeenCalled();
    expect(result).toEqual(created);
  });

  test('deleteIndisponibility deletes a period', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
    });

    await deleteIndisponibility(10, token);

    expect(globalThis.fetch).toHaveBeenCalledWith(`/api/indisponibilities/10`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
  });

  test('fetchIndisponibilityById throws JSON error message', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
      text: async () => JSON.stringify({ message: 'NOT_FOUND' }),
    });

    await expect(fetchIndisponibilityById(10, token)).rejects.toThrow(
      'NOT_FOUND',
    );
  });

  test('fetchIndisponibilities returns fallback when JSON.parse fails', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
      text: async () => '<<<NOT_JSON>>>',
    });

    await expect(fetchIndisponibilities(userId, token)).rejects.toThrow(
      '<<<NOT_JSON>>>',
    );
  });

  test('fetchIndisponibilityById uses fallback when empty body', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
      text: async () => '',
    });

    await expect(fetchIndisponibilityById(10, token)).rejects.toThrow(
      'Impossible de récupérer l’indisponibilité',
    );
  });

  test('fetchIndisponibilityById returns raw text error', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
      text: async () => 'Erreur brute ID',
    });

    await expect(fetchIndisponibilityById(10, token)).rejects.toThrow(
      'Erreur brute ID',
    );
  });

  test('createIndisponibility returns raw text error', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
      text: async () => 'Erreur création brute',
    });

    await expect(
      createIndisponibility(userId, token, '2025-01-01', '2025-01-02'),
    ).rejects.toThrow('Erreur création brute');
  });
});
