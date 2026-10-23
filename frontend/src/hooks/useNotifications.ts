import { useEffect, useState } from 'react';
import { fetchNotifications } from '../services/notifications.service';

export const useNotifications = (
  token: string | undefined,
  userId?: number,
  pathname?: string,
) => {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  useEffect(() => {
    if (!userId || !token) {
      setHasUnreadNotifications(false);
      return;
    }

    const getNotifications = async () => {
      try {
        const data = await fetchNotifications(userId, token);
        setHasUnreadNotifications(
          data.some((notification) => !notification.lu),
        );
      } catch (err) {
        console.error('useNotifications::error', err);
      }
    };

    getNotifications();
  }, [userId, token, pathname]);

  return { hasUnreadNotifications };
};
