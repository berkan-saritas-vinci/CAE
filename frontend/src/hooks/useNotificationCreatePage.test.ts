import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useNotificationCreatePage } from './useNotificationCreatePage';
import {
  createNotificationForUser,
  fetchNotificationRecipients,
} from '../services/notifications.service';

const mockedNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockedNavigate,
}));

vi.mock('../services/notifications.service', () => ({
  createNotificationForUser: vi.fn(),
  fetchNotificationRecipients: vi.fn(),
}));

describe('useNotificationCreatePage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    (fetchNotificationRecipients as ReturnType<typeof vi.fn>).mockResolvedValue(
      [],
    );
  });

  test('loads recipient users', async () => {
    (fetchNotificationRecipients as ReturnType<typeof vi.fn>).mockResolvedValue(
      [
        { id: 1, tag: 'A' },
        { id: 2, tag: 'B' },
      ],
    );

    const { result } = renderHook(() =>
      useNotificationCreatePage({
        id: 10,
        mail: 'admin@mail.com',
        password: 'pwd',
        token: 'token',
        tag: 'Admin',
        picture: '',
        speciality: {},
        role: 'ADMIN',
      }),
    );

    await waitFor(() => {
      expect(result.current.loadingUsers).toBe(false);
    });

    expect(fetchNotificationRecipients).toHaveBeenCalledWith('token');
    expect(result.current.users).toHaveLength(2);
    expect(result.current.isAdmin).toBe(true);
  });

  test('handleSubmit sets an error when message is empty', async () => {
    const { result } = renderHook(() =>
      useNotificationCreatePage({
        id: 10,
        mail: 'admin@mail.com',
        password: 'pwd',
        token: 'token',
        tag: 'Admin',
        picture: '',
        speciality: {},
        role: 'ADMIN',
      }),
    );

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.error).toBe('Le message est obligatoire.');
    expect(createNotificationForUser).not.toHaveBeenCalled();
  });

  test('handleSubmit creates notification then redirects', async () => {
    vi.useFakeTimers();
    (createNotificationForUser as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );

    const { result } = renderHook(() =>
      useNotificationCreatePage({
        id: 10,
        mail: 'admin@mail.com',
        password: 'pwd',
        token: 'token',
        tag: 'Admin',
        picture: '',
        speciality: {},
        role: 'ADMIN',
      }),
    );

    act(() => {
      result.current.setMessage('Hello');
      result.current.setTargetUserId(99);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(createNotificationForUser).toHaveBeenCalledWith({
      token: 'token',
      message: 'Hello',
      targetUserId: 99,
    });
    expect(result.current.success).toBe('Notification envoyée avec succès.');

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(mockedNavigate).toHaveBeenCalledWith('/notifications');
  });
});
