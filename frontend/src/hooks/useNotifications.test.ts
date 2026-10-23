import { beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNotifications } from './useNotifications';
import { fetchNotifications } from '../services/notifications.service';

vi.mock('../services/notifications.service', () => ({
  fetchNotifications: vi.fn(),
}));

describe('useNotifications', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  test('stays false without token or userId', async () => {
    const { result } = renderHook(() => useNotifications(undefined, undefined));

    await waitFor(() => {
      expect(result.current.hasUnreadNotifications).toBe(false);
    });

    expect(fetchNotifications).not.toHaveBeenCalled();
  });

  test('becomes true when at least one notification is unread', async () => {
    (fetchNotifications as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, message: 'A', date: '2026-01-01', lu: true, user: {} },
      { id: 2, message: 'B', date: '2026-01-02', lu: false, user: {} },
    ]);

    const { result } = renderHook(() => useNotifications('token', 8, '/home'));

    await waitFor(() => {
      expect(result.current.hasUnreadNotifications).toBe(true);
    });

    expect(fetchNotifications).toHaveBeenCalledWith(8, 'token');
  });
});
