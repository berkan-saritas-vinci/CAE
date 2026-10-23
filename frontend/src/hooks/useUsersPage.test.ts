import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUsersPage } from './useUsersPage';
import * as usersService from '../services/usersPage.service';

vi.mock('../services/usersPage.service', () => ({
  fetchAllUsers: vi.fn(),
  fetchAllTeams: vi.fn(),
  searchUserByTag: vi.fn(),
  toggleUserRole: vi.fn(),
  banUser: vi.fn(),
}));

type TestLocalUser = {
  id: number;
  tag: string;
  picture: string;
  role: 'USER' | 'ADMIN' | 'BANNED';
};

describe('useUsersPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('charge les utilisateurs en mode USER', async () => {
    const users = [
      { id: 1, tag: 'alice', picture: '', role: 'USER' },
      { id: 2, tag: 'bob', picture: '', role: 'ADMIN' },
    ];
    (
      usersService.fetchAllUsers as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(users);

    const { result } = renderHook(() => useUsersPage('token-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(usersService.fetchAllUsers).toHaveBeenCalledWith('token-1');
    expect(result.current.users).toEqual(users);
    expect(result.current.filteredUsers).toEqual(users);
  });

  it('met à jour un utilisateur après toggleUserRole', async () => {
    const users: TestLocalUser[] = [
      { id: 1, tag: 'alice', picture: '', role: 'USER' },
    ];
    const updated: TestLocalUser = {
      id: 1,
      tag: 'alice',
      picture: '',
      role: 'ADMIN',
    };

    (
      usersService.fetchAllUsers as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(users);
    (
      usersService.toggleUserRole as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(updated);

    const { result } = renderHook(() => useUsersPage('token-2'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleToggleRole(users[0]);
    });

    expect(usersService.toggleUserRole).toHaveBeenCalledWith(1, 'token-2');
    expect(result.current.users[0].role).toBe('ADMIN');
    expect(result.current.updatingUserId).toBeNull();
  });
});
