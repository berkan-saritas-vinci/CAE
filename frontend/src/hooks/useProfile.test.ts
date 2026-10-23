import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useProfile } from './useProfile';
import {
  fetchProfile,
  fetchProfilePictures,
  fetchUserTeam,
  updatePassword,
  updateProfile,
} from '../services/profile.service';

vi.mock('../services/profile.service', () => ({
  fetchProfile: vi.fn(),
  fetchProfilePictures: vi.fn(),
  fetchUserTeam: vi.fn(),
  updatePassword: vi.fn(),
  updateProfile: vi.fn(),
}));

describe('useProfile', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  test('sets an error when user is not connected', async () => {
    (fetchProfilePictures as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const { result } = renderHook(() => useProfile(undefined));

    await waitFor(() => {
      expect(result.current.error).toBe('Utilisateur non connecté');
    });
  });

  test('loads profile, team, and pictures', async () => {
    (fetchProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      mail: 'u@mail.com',
      password: 'pwd',
      token: 'token',
      tag: 'U1',
      picture: 'a.png',
      speciality: 'Support',
      creationDate: '2026-01-01',
    });
    (fetchUserTeam as ReturnType<typeof vi.fn>).mockResolvedValue({
      name: 'Team A',
    });
    (fetchProfilePictures as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, path: 'a.png' },
    ]);

    const { result } = renderHook(() =>
      useProfile({
        id: 1,
        mail: 'u@mail.com',
        password: 'pwd',
        token: 'token',
        tag: 'U1',
        picture: 'a.png',
        speciality: 'Support',
      }),
    );

    await waitFor(() => {
      expect(result.current.loadingProfile).toBe(false);
    });

    expect(fetchProfile).toHaveBeenCalledWith(1);
    expect(fetchUserTeam).toHaveBeenCalledWith(1);
    expect(result.current.team).toBe('Team A');
    expect(result.current.pictures).toHaveLength(1);
  });

  test('onSpecialityChange updates profile', async () => {
    (fetchProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      mail: 'u@mail.com',
      password: 'pwd',
      token: 'token',
      tag: 'U1',
      picture: 'a.png',
      speciality: 'Support',
    });
    (fetchUserTeam as ReturnType<typeof vi.fn>).mockResolvedValue({
      name: 'Team A',
    });
    (fetchProfilePictures as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (updateProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
      speciality: 'Tank',
    });

    const { result } = renderHook(() =>
      useProfile({
        id: 1,
        mail: 'u@mail.com',
        password: 'pwd',
        token: 'token',
        tag: 'U1',
        picture: 'a.png',
        speciality: 'Support',
      }),
    );

    await waitFor(() => {
      expect(result.current.loadingProfile).toBe(false);
    });

    await act(async () => {
      await result.current.onSpecialityChange('Tank');
    });

    expect(updateProfile).toHaveBeenCalledWith('token', { speciality: 'Tank' });
  });

  test('onPasswordChange validates required fields', async () => {
    (fetchProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      mail: 'u@mail.com',
      password: 'pwd',
      token: 'token',
      tag: 'U1',
      picture: 'a.png',
      speciality: 'Support',
    });
    (fetchUserTeam as ReturnType<typeof vi.fn>).mockResolvedValue({
      name: 'Team A',
    });
    (fetchProfilePictures as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (updatePassword as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useProfile({
        id: 1,
        mail: 'u@mail.com',
        password: 'pwd',
        token: 'token',
        tag: 'U1',
        picture: 'a.png',
        speciality: 'Support',
      }),
    );

    await waitFor(() => {
      expect(result.current.loadingProfile).toBe(false);
    });

    await act(async () => {
      await result.current.onPasswordChange();
    });

    expect(result.current.saveMessage).toBe('Veuillez remplir tous les champs');
    expect(updatePassword).not.toHaveBeenCalled();
  });
});
