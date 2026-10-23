import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchNotifications,
  markNotificationAsRead,
} from '../services/notifications.service';
import { Notification } from '../types';

export const useNotificationPage = (token: string, userId?: number) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    setLoadingNotifications(true);
    try {
      const data = await fetchNotifications(userId, token);
      setNotifications(data);
    } catch (err) {
      console.error('useNotificationPage::error', err);
    } finally {
      setLoadingNotifications(false);
    }
  }, [userId, token]);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    loadNotifications();
  }, [userId, loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.lu).length,
    [notifications],
  );

  const setAsRead = async (notificationId: number, token: string) => {
    await markNotificationAsRead(notificationId, token);
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, lu: true }
          : notification,
      ),
    );
  };

  const setAllAsRead = async (token: string) => {
    const unreadIds = notifications
      .filter((notification) => !notification.lu)
      .map((notification) => notification.id);

    if (unreadIds.length === 0) return;

    const results = await Promise.allSettled(
      unreadIds.map((notificationId) =>
        markNotificationAsRead(notificationId, token),
      ),
    );

    const readIds = unreadIds.filter(
      (_notificationId, index) => results[index].status === 'fulfilled',
    );

    if (readIds.length > 0) {
      setNotifications((prev) =>
        prev.map((notification) =>
          readIds.includes(notification.id)
            ? { ...notification, lu: true }
            : notification,
        ),
      );
    }

    if (readIds.length !== unreadIds.length) {
      throw new Error(
        "Certaines notifications n'ont pas pu etre marquees comme lues",
      );
    }
  };

  return {
    notifications,
    unreadCount,
    loadingNotifications,
    setAsRead,
    setAllAsRead,
  };
};
