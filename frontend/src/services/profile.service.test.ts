import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest';
import {
  fetchProfile,
  fetchUserTeam,
  fetchProfilePictures,
  updateProfile,
  updatePassword,
} from './profile.service';
import { AuthenticatedUser } from '../types';

describe('profile.service', () => {
  let mockFetch: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn() as unknown as typeof fetch;
    mockFetch = globalThis.fetch as unknown as Mock;
  });

  test('updateProfile sends Authorization header when token is provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await updateProfile('abc123', { speciality: 'Backend' });

    expect(mockFetch).toHaveBeenCalledWith('/api/auths/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'abc123',
      },
      body: JSON.stringify({ speciality: 'Backend' }),
    });
  });

  test('updateProfile does NOT send Authorization header when token is empty string', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await updateProfile('', { speciality: 'Backend' });

    expect(mockFetch).toHaveBeenCalledWith('/api/auths/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ speciality: 'Backend' }),
    });
  });

  test('fetchProfile returns user profile', async () => {
    const sample = { id: 1, name: 'John', creationDate: '2024-01-01' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sample,
    });

    const result = await fetchProfile(1);
    expect(result).toEqual(sample);
  });

  test('fetchUserTeam returns team name', async () => {
    const sample = { name: 'Dev Team' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sample,
    });

    const result = await fetchUserTeam(3);
    expect(result).toEqual(sample);
  });

  test('fetchUserTeam uses fallback message when backend JSON has no message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
      text: async () => 'unused text',
    });

    await expect(fetchUserTeam(3)).rejects.toThrow(
      'Erreur lors de la récupération de la team',
    );
  });

  test('fetchUserTeam throws JSON error message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'TEAM_ERROR' }),
    });

    await expect(fetchUserTeam(3)).rejects.toThrow('TEAM_ERROR');
  });

  test('fetchProfilePictures returns list of pictures', async () => {
    const sample = [{ id: 1, link: 'img.png' }];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sample,
    });

    const result = await fetchProfilePictures();
    expect(result).toEqual(sample);
  });

  test('fetchProfilePictures throws raw text error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error('Invalid JSON');
      },
      text: async () => 'PICTURES_ERROR',
    });

    await expect(fetchProfilePictures()).rejects.toThrow('PICTURES_ERROR');
  });

  test('updateProfile returns updated user fields', async () => {
    const updated: Partial<AuthenticatedUser> = { speciality: 'Frontend' };

    const mockJson = vi.fn().mockResolvedValue(updated);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: mockJson,
    });

    const result = await updateProfile('token123', { speciality: 'Frontend' });

    expect(mockJson).toHaveBeenCalled();
    expect(result).toEqual(updated);
  });

  test('updatePassword succeeds when backend returns ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    await expect(
      updatePassword('token123', 'oldPass', 'newPass'),
    ).resolves.not.toThrow();

    expect(mockFetch).toHaveBeenCalledWith('/api/auths/users/me/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'token123',
      },
      body: JSON.stringify({
        oldPassword: 'oldPass',
        newPassword: 'newPass',
      }),
    });
  });

  test('fetchProfile returns JSON error message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'PROFILE_ERROR' }),
    });

    await expect(fetchProfile(1)).rejects.toThrow('PROFILE_ERROR');
  });

  test('fetchProfile returns raw text error when backend sends plain text', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error('Invalid JSON');
      },
      text: async () => 'Erreur brute',
    });

    await expect(fetchProfile(1)).rejects.toThrow('Erreur brute');
  });

  test('fetchProfile uses fallback when body is empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error('Invalid JSON');
      },
      text: async () => '',
    });

    await expect(fetchProfile(1)).rejects.toThrow(
      'Impossible de récupérer le profil',
    );
  });

  test('updateProfile returns JSON error message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'UPDATE_ERROR' }),
    });

    await expect(
      updateProfile('token123', { speciality: 'Backend' }),
    ).rejects.toThrow('UPDATE_ERROR');
  });

  test('updatePassword returns JSON error message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'PASSWORD_ERROR' }),
    });

    await expect(updatePassword('token123', 'old', 'new')).rejects.toThrow(
      'PASSWORD_ERROR',
    );
  });
});
