import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useApp } from './useApp';
import { fetchUserTeam } from '../services/profile.service';
import {
  clearAuthenticatedUser,
  getAuthenticatedUser,
  storeAuthenticatedUser,
} from '../utils/session';

vi.mock('../services/profile.service');
vi.mock('../utils/session');
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

const mockUser = { id: '1', mail: 'user@test.com', role: 'USER' };
const mockTeam = { id: 'team-1', name: 'Team A' };

describe('useApp', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    (getAuthenticatedUser as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  // --- INITIALISATION ---

  test('initializes with empty state', () => {
    const { result } = renderHook(() => useApp());

    expect(result.current.authenticatedUser).toBeUndefined();
    expect(result.current.loginNotification).toBe(false);
    expect(result.current.logoutNotification).toBe(false);
    expect(result.current.registrationNotification).toBe(false);
    expect(result.current.loginError).toBeNull();
  });

  test('loads user from storage on mount', () => {
    (getAuthenticatedUser as ReturnType<typeof vi.fn>).mockReturnValue(
      mockUser,
    );

    const { result } = renderHook(() => useApp());

    expect(result.current.authenticatedUser).toEqual(mockUser);
  });

  // --- INSCRIPTION ---

  test('registerUser succeeds and shows notification', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    const { result } = renderHook(() => useApp());

    await act(async () => {
      await result.current.registerUser({
        picture: 'pic',
        mail: 'test@test.com',
        password: 'Password123!',
        tag: 'tag',
        speciality: 'speciality',
      });
    });

    expect(result.current.registrationNotification).toBe(true);
  });

  test('registerUser fails on API error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      }),
    );
    const { result } = renderHook(() => useApp());

    await expect(
      act(async () => {
        await result.current.registerUser({
          picture: 'pic',
          mail: 'test@test.com',
          password: 'Password123!',
          tag: 'tag',
          speciality: 'speciality',
        });
      }),
    ).rejects.toThrow();
  });

  // --- CONNEXION ---

  test('loginUser fails when account is banned (403)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 403 }));
    const { result } = renderHook(() => useApp());

    await act(async () => {
      await result.current.loginUser(
        { mail: 'banned@test.com', password: 'pwd' },
        false,
      );
    });

    expect(result.current.loginError).toBe(
      'Ce compte est banni et ne peut plus se connecter.',
    );
  });

  test('loginUser succeeds with team and remembers user', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      }),
    );
    (fetchUserTeam as ReturnType<typeof vi.fn>).mockResolvedValue(mockTeam);

    const { result } = renderHook(() => useApp());

    await act(async () => {
      await result.current.loginUser(
        { mail: mockUser.mail, password: 'pwd' },
        true,
      );
    });

    expect(result.current.authenticatedUser).toEqual({
      ...mockUser,
      team: mockTeam.id,
    });
    expect(result.current.loginNotification).toBe(true);
    expect(storeAuthenticatedUser).toHaveBeenCalledWith({
      ...mockUser,
      team: mockTeam.id,
    });
  });

  test('loginUser stores user in session when rememberMe is false', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      }),
    );
    (fetchUserTeam as ReturnType<typeof vi.fn>).mockResolvedValue(mockTeam);

    // Mock sessionStorage
    const sessionStorageMock = {
      setItem: vi.fn(),
      getItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
    };
    vi.stubGlobal('sessionStorage', sessionStorageMock);

    const { result } = renderHook(() => useApp());

    await act(async () => {
      await result.current.loginUser(
        { mail: mockUser.mail, password: 'pwd' },
        false,
      );
    });

    const expectedUser = { ...mockUser, team: mockTeam.id };
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'authenticatedUser',
      JSON.stringify(expectedUser),
    );
  });

  test('loginUser succeeds without team if team data is invalid', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      }),
    );
    (fetchUserTeam as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (storeAuthenticatedUser as ReturnType<typeof vi.fn>).mockImplementation(
      () => undefined,
    );

    const { result } = renderHook(() => useApp());

    await act(async () => {
      await result.current.loginUser(
        { mail: mockUser.mail, password: 'pwd' },
        true,
      );
    });

    expect(result.current.authenticatedUser).toEqual(mockUser);
    expect(result.current.loginNotification).toBe(true);
  });

  // --- DÉCONNEXION ---

  test('clearUser clears user and shows notification', () => {
    const { result } = renderHook(() => useApp());

    act(() => {
      result.current.clearUser();
    });

    expect(result.current.authenticatedUser).toBeUndefined();
    expect(result.current.logoutNotification).toBe(true);
    expect(clearAuthenticatedUser).toHaveBeenCalled();
  });
});
