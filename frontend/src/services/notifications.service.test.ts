import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  createNotificationForUser,
  fetchNotificationRecipients,
  fetchNotifications,
  markNotificationAsRead,
} from './notifications.service';

const mockToken = 'Bearer test-token-123';

describe('notifications.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  test('fetchNotifications returns notifications when request succeeds', async () => {
    const notifications = [
      {
        id: 1,
        message: 'Bonjour',
        date: '2026-03-30T10:00:00',
        lu: false,
      },
    ];

    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => notifications,
    });

    const result = await fetchNotifications(42, mockToken);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/notifications/42', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: mockToken,
      },
    });
    expect(result).toEqual(notifications);
  });

  test('fetchNotifications throws when request fails', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchNotifications(42, mockToken)).rejects.toThrow(
      'Erreur notifications',
    );
  });

  test('markNotificationAsRead sends PATCH and succeeds', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
    });

    await markNotificationAsRead(7, mockToken);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/notificationsusers/7/lu',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: mockToken,
        },
      },
    );
  });

  test('markNotificationAsRead throws when request fails', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
    });

    await expect(markNotificationAsRead(7, mockToken)).rejects.toThrow(
      'Impossible de marquer comme lu',
    );
  });

  test('fetchNotificationRecipients returns users when request succeeds', async () => {
    const recipients = [
      {
        id: 1,
        tag: 'alice',
        picture: 'https://example.com/pic.png',
        role: 'USER',
      },
    ];

    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => recipients,
    });

    const result = await fetchNotificationRecipients('token-123');

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/auths/users', {
      headers: {
        Authorization: 'Bearer token-123',
      },
    });
    expect(result).toEqual(recipients);
  });

  test('fetchNotificationRecipients throws when request fails', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchNotificationRecipients('token-123')).rejects.toThrow(
      'Erreur récupération utilisateurs',
    );
  });

  test('createNotificationForUser creates notification then relation', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 99 }),
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    await createNotificationForUser({
      token: 'token-abc',
      message: 'Nouveau message',
      targetUserId: 15,
    });

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    expect(fetchMock).toHaveBeenCalledTimes(2);

    expect(fetchMock.mock.calls[0][0]).toBe('/api/notifications');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'token-abc',
      },
    });
    const firstBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(firstBody.message).toBe('Nouveau message');
    expect(firstBody.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);

    expect(fetchMock.mock.calls[1][0]).toBe('/api/notificationsusers');
    expect(fetchMock.mock.calls[1][1]).toEqual({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'token-abc',
      },
      body: JSON.stringify({
        user: { id: 15 },
        notification: { id: 99 },
      }),
    });
  });

  test('createNotificationForUser throws when notification creation fails', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
    });

    await expect(
      createNotificationForUser({
        token: 'token-abc',
        message: 'Nouveau message',
        targetUserId: 15,
      }),
    ).rejects.toThrow('Impossible de créer la notification');
  });

  test('createNotificationForUser throws when relation creation fails', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 99 }),
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    await expect(
      createNotificationForUser({
        token: 'token-abc',
        message: 'Nouveau message',
        targetUserId: 15,
      }),
    ).rejects.toThrow('Impossible de lier la notification à cet utilisateur');
  });
});
