import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useLogin } from './useLogin';
import { emailChecker } from '../utils/utils';

vi.mock('../utils/utils', () => ({
  emailChecker: vi.fn(),
}));

describe('useLogin', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  test('returns false when email is invalid', async () => {
    (emailChecker as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const loginUser = vi.fn();
    const { result } = renderHook(() => useLogin(loginUser));

    let ok = false;
    await act(async () => {
      ok = await result.current.handleLogin('bad-mail', 'pwd', false);
    });

    expect(ok).toBe(false);
    expect(result.current.mailError).toBe(
      'Veuillez entrez une adresse email valide',
    );
    expect(loginUser).not.toHaveBeenCalled();
  });

  test('returns true when login succeeds', async () => {
    (emailChecker as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const loginUser = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useLogin(loginUser));

    let ok = false;
    await act(async () => {
      ok = await result.current.handleLogin('user@mail.com', 'pwd', true);
    });

    expect(ok).toBe(true);
    expect(loginUser).toHaveBeenCalledWith(
      { mail: 'user@mail.com', password: 'pwd' },
      true,
    );
  });

  test('returns false when login fails', async () => {
    (emailChecker as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const loginUser = vi.fn().mockRejectedValue(new Error('bad credentials'));
    const { result } = renderHook(() => useLogin(loginUser));

    let ok = true;
    await act(async () => {
      ok = await result.current.handleLogin('user@mail.com', 'pwd', false);
    });

    expect(ok).toBe(false);
    expect(result.current.loginError).toBe(
      'Adresse mail ou mot de passe incorrect',
    );
  });
});
