import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  fetchAllUsers,
  fetchAllTeams,
  toggleUserRole,
  banUser,
} from './usersPage.service';
import { User, Team } from '../types';

describe('usersPage.service', () => {
  const token = 'test-token';

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn() as unknown as typeof fetch;
  });

  test('fetchAllUsers sends Authorization header when token is provided', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await fetchAllUsers(token);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/auths/users', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
  });

  test('fetchAllUsers sends no headers when token is missing', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await fetchAllUsers(undefined);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/auths/users', {
      headers: {},
    });
  });

  test('fetchAllUsers returns list of users', async () => {
    const sample: User[] = [
      {
        id: 1,
        mail: 'john@mail.com',
        role: 'USER',
        password: '',
      },
    ];

    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => sample,
    });

    const result = await fetchAllUsers(token);
    expect(result).toEqual(sample);
  });

  test('fetchAllUsers throws error when request fails', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchAllUsers(token)).rejects.toThrow(
      'Erreur récupération utilisateurs',
    );
  });

  test('fetchAllTeams returns list of teams', async () => {
    const sample: Team[] = [
      {
        id: 1,
        name: 'Team A',
        members: [],
        responsable: '',
      },
    ];

    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => sample,
    });

    const result = await fetchAllTeams();
    expect(result).toEqual(sample);
  });

  test('fetchAllTeams throws error when request fails', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchAllTeams()).rejects.toThrow('Erreur récupération teams');
  });

  test('toggleUserRole returns updated user', async () => {
    const sample: User = {
      id: 5,
      mail: 'role@mail.com',
      role: 'ADMIN',
      password: '',
    };

    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => sample,
    });

    const result = await toggleUserRole(5, token);
    expect(result).toEqual(sample);
  });

  test('toggleUserRole throws error when request fails', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
    });

    await expect(toggleUserRole(5, token)).rejects.toThrow(
      'Erreur mise à jour rôle',
    );
  });

  test('banUser returns updated user', async () => {
    const sample: User = {
      id: 7,

      mail: 'ban@mail.com',
      role: 'USER',
      password: '',
    };

    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => sample,
    });

    const result = await banUser(7, token);
    expect(result).toEqual(sample);
  });

  test('banUser throws error when request fails', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
    });

    await expect(banUser(7, token)).rejects.toThrow('Erreur bannissement');
  });
});
