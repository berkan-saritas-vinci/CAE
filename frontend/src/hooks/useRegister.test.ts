import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useRegister } from './useRegister';
import { emailChecker, passwordChecker } from '../utils/utils';
import { RegisterError, registerUser } from '../services/register.service';

const mockedNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockedNavigate,
}));

vi.mock('../utils/utils', () => ({
  emailChecker: vi.fn(),
  passwordChecker: vi.fn(),
}));

vi.mock('../services/register.service', () => ({
  registerUser: vi.fn(),
  RegisterError: class RegisterError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));

describe('useRegister', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    sessionStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  test('sets an error when email is invalid', async () => {
    (emailChecker as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (passwordChecker as ReturnType<typeof vi.fn>).mockReturnValue(true);

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.handleMailInputChange({
        target: { value: 'bad-mail' },
      } as unknown as React.SyntheticEvent);
      result.current.handlePasswordInputChange({
        target: { value: 'Pass123!' },
      } as unknown as React.SyntheticEvent);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.SyntheticEvent);
    });

    expect(result.current.mailError).toBe(
      'Veuillez entrez une adresse email valide',
    );
    expect(registerUser).not.toHaveBeenCalled();
  });

  test('registers user then redirects to welcome', async () => {
    (emailChecker as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (passwordChecker as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (registerUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setPicture('avatar.png');
      result.current.setSpeciality('Support');
      result.current.handleMailInputChange({
        target: { value: 'user@mail.com' },
      } as unknown as React.SyntheticEvent);
      result.current.handlePasswordInputChange({
        target: { value: 'Pass123!' },
      } as unknown as React.SyntheticEvent);
      result.current.handleTagInputChange({
        target: { value: 'tag' },
      } as unknown as React.SyntheticEvent);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.SyntheticEvent);
    });

    expect(registerUser).toHaveBeenCalled();
    expect(sessionStorage.getItem('pendingUser')).toBe(
      JSON.stringify({ id: 1 }),
    );
    expect(mockedNavigate).toHaveBeenCalledWith('/welcome');
  });

  test('shows a specific message for 409 error', async () => {
    (emailChecker as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (passwordChecker as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (registerUser as ReturnType<typeof vi.fn>).mockRejectedValue(
      new RegisterError('exists', 409),
    );

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.handleMailInputChange({
        target: { value: 'user@mail.com' },
      } as unknown as React.SyntheticEvent);
      result.current.handlePasswordInputChange({
        target: { value: 'Pass123!' },
      } as unknown as React.SyntheticEvent);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.SyntheticEvent);
    });

    expect(result.current.mailError).toBe('Cette adresse email existe déjà.');
  });
});
