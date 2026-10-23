import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useNotificationPage } from './useNotificationPage';
import {
  fetchNotifications,
  markNotificationAsRead,
} from '../services/notifications.service';

vi.mock('../services/notifications.service', () => ({
  fetchNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
}));

describe('useNotificationPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  test('loads notifications and computes unreadCount', async () => {
    (fetchNotifications as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, message: 'A', date: '2026-01-01', lu: false, user: {} },
      { id: 2, message: 'B', date: '2026-01-02', lu: true, user: {} },
    ]);

    const { result } = renderHook(() => useNotificationPage('token', 10));

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(2);
    });

    expect(fetchNotifications).toHaveBeenCalledWith(10, 'token');
    expect(result.current.unreadCount).toBe(1);
  });

  test('setAsRead updates local state', async () => {
    (fetchNotifications as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, message: 'A', date: '2026-01-01', lu: false, user: {} },
    ]);
    (markNotificationAsRead as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );

    const { result } = renderHook(() => useNotificationPage('token', 10));

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });

    await act(async () => {
      await result.current.setAsRead(1, 'token');
    });

    expect(markNotificationAsRead).toHaveBeenCalledWith(1, 'token');
    expect(result.current.notifications[0].lu).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  test('setAllAsRead marks all unread notifications locally', async () => {
    (fetchNotifications as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, message: 'A', date: '2026-01-01', lu: false, user: {} },
      { id: 2, message: 'B', date: '2026-01-02', lu: false, user: {} },
      { id: 3, message: 'C', date: '2026-01-03', lu: true, user: {} },
    ]);
    (markNotificationAsRead as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );

    const { result } = renderHook(() => useNotificationPage('token', 10));

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(3);
    });

    await act(async () => {
      await result.current.setAllAsRead('token');
    });

    expect(markNotificationAsRead).toHaveBeenCalledTimes(2);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.every((n) => n.lu)).toBe(true);
  });
});
