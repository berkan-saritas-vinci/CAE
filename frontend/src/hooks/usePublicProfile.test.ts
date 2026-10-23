import { describe, test, expect, beforeEach, vi, type Mock } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePublicProfile } from './usePublicProfile';
import {
  getUserById,
  getTeamForUser,
  type PublicUser,
} from '../services/publicProfile.service';

vi.mock('../services/publicProfile.service');

describe('usePublicProfile', () => {
  const mockUser: PublicUser = {
    id: 1,
    mail: 'user@mail.com',
    tag: 'U1',
    picture: 'pic.png',
    speciality: 'Support',
    password: '',
    token: '',
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('ne fait rien si userId est absent', async () => {
    const { result } = renderHook(() => usePublicProfile(undefined));

    expect(result.current.user).toBeNull();
    expect(result.current.team).toBe('Aucune team');
    expect(result.current.error).toBe('');
  });

  test('charge le profil utilisateur', async () => {
    (getUserById as Mock).mockResolvedValue(mockUser);
    (getTeamForUser as Mock).mockResolvedValue({ name: 'Team A' });

    const { result } = renderHook(() => usePublicProfile('1'));

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });

    expect(getUserById).toHaveBeenCalledWith('1');
    expect(result.current.user).toEqual(mockUser);
  });

  test('charge la team de l’utilisateur', async () => {
    (getUserById as Mock).mockResolvedValue(mockUser);
    (getTeamForUser as Mock).mockResolvedValue({ name: 'Team A' });

    const { result } = renderHook(() => usePublicProfile('1'));

    await waitFor(() => {
      expect(result.current.team).toBe('Team A');
    });

    expect(getTeamForUser).toHaveBeenCalledWith('1');
  });

  test('gère une erreur lors du chargement du profil', async () => {
    (getUserById as Mock).mockRejectedValue(new Error('fail'));
    (getTeamForUser as Mock).mockResolvedValue({ name: 'Team A' });

    const { result } = renderHook(() => usePublicProfile('1'));

    await waitFor(() => {
      expect(result.current.error).toBe('Erreur récupération profil');
    });

    expect(result.current.user).toBeNull();
  });

  test('gère une erreur lors du chargement de la team', async () => {
    (getUserById as Mock).mockResolvedValue(mockUser);
    (getTeamForUser as Mock).mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => usePublicProfile('1'));

    await waitFor(() => {
      expect(result.current.team).toBe('Aucune team');
    });
  });
});
