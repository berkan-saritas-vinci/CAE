import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaybeAuthenticatedUser } from '../types';
import {
  createNotificationForUser,
  fetchNotificationRecipients,
  NotificationRecipient,
} from '../services/notifications.service';

export const useNotificationCreatePage = (
  authenticatedUser: MaybeAuthenticatedUser,
) => {
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [users, setUsers] = useState<NotificationRecipient[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [inputValue, setInputValue] = useState('');

  const token = authenticatedUser?.token;
  const isAuthenticated = Boolean(authenticatedUser);
  const isAdmin = authenticatedUser?.role === 'ADMIN';

  const selectedUser = useMemo(
    () => users.find((user) => user.id === targetUserId) ?? null,
    [users, targetUserId],
  );

  useEffect(() => {
    const loadUsers = async () => {
      if (!token) {
        setLoadingUsers(false);
        return;
      }

      try {
        const recipients = await fetchNotificationRecipients(token);
        setUsers(recipients);
      } catch {
        setError('Impossible de charger les utilisateurs');
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!message.trim()) {
      setError('Le message est obligatoire.');
      return;
    }

    if (!targetUserId) {
      setError('Veuillez sélectionner un utilisateur.');
      return;
    }

    if (!token) {
      setError('Utilisateur non authentifié.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createNotificationForUser({
        token,
        message: message.trim(),
        targetUserId,
      });

      setSuccess('Notification envoyée avec succès.');
      setMessage('');
      setTargetUserId(null);
      setInputValue('');

      setTimeout(() => {
        navigate('/notifications');
      });
    } catch (submitError) {
      console.error(
        'useNotificationCreatePage::handleSubmit::error',
        submitError,
      );
      setError('La création de la notification a échoué.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => navigate(-1);
  const goToNotifications = () => navigate('/notifications');

  return {
    message,
    setMessage,
    targetUserId,
    setTargetUserId,
    error,
    success,
    isSubmitting,
    users,
    loadingUsers,
    inputValue,
    setInputValue,
    selectedUser,
    isAuthenticated,
    isAdmin,
    handleSubmit,
    goBack,
    goToNotifications,
  };
};
