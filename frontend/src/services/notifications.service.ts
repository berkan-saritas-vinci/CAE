import { Notification } from '../types';
import { getAuthHeaders } from './profile.service';

export interface NotificationRecipient {
  id: number;
  tag: string;
  picture: string | { link: string };
  role: 'USER' | 'ADMIN' | 'BANNED';
}

interface CreatedNotification {
  id: number;
}

export const fetchNotifications = async (
  userId: number,
  token: string,
): Promise<Notification[]> => {
  const res = await fetch(`/api/notifications/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    throw new Error('Erreur notifications');
  }
  return res.json();
};

export const markNotificationAsRead = async (
  notificationId: number,
  token: string,
): Promise<void> => {
  const res = await fetch(`/api/notificationsusers/${notificationId}/lu`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    throw new Error('Impossible de marquer comme lu');
  }
};

export const fetchNotificationRecipients = async (
  token: string,
): Promise<NotificationRecipient[]> => {
  const res = await fetch('/api/auths/users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Erreur récupération utilisateurs');
  }

  return res.json();
};

export const createNotificationForUser = async (params: {
  token: string;
  message: string;
  targetUserId: number;
}): Promise<void> => {
  const { token, message, targetUserId } = params;
  const formattedDate = new Date().toISOString().slice(0, 19);

  const createNotificationResponse = await fetch('/api/notifications', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      message,
      date: formattedDate,
    }),
  });

  if (!createNotificationResponse.ok) {
    throw new Error('Impossible de créer la notification');
  }

  const createdNotification: CreatedNotification =
    await createNotificationResponse.json();

  const createRelationResponse = await fetch('/api/notificationsusers', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      user: { id: targetUserId },
      notification: { id: createdNotification.id },
    }),
  });

  if (!createRelationResponse.ok) {
    throw new Error('Impossible de lier la notification à cet utilisateur');
  }
};
