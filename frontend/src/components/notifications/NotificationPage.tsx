import { useState } from 'react';
import {
  Container,
  Grid2,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { LoginContext } from '../../types';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useNotificationPage } from '../../hooks/useNotificationPage';
import NotificationCard from './NotificationCard';

function NotificationTab() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { authenticatedUser } = useOutletContext<LoginContext>();

  const userId = authenticatedUser?.id;
  const userRole = authenticatedUser?.role;

  const {
    notifications,
    unreadCount,
    loadingNotifications,
    setAsRead,
    setAllAsRead,
  } = useNotificationPage(authenticatedUser?.token || '', userId);

  if (!authenticatedUser) {
    return;
  }

  if (!userId || !userRole) {
    return <Typography>Chargement des notifications...</Typography>;
  }

  if (loadingNotifications && notifications.length === 0) {
    return <Typography>Chargement des notifications...</Typography>;
  }

  const lu = async (notificationId: number) => {
    try {
      setError('');
      await setAsRead(notificationId, authenticatedUser.token);
    } catch (err) {
      console.error('NotificationPage::lu', err);
      setError('Impossible de marquer comme lu');
    }
  };

  const luTout = async () => {
    try {
      setError('');
      await setAllAsRead(authenticatedUser.token);
    } catch (err) {
      console.error('NotificationPage::luTout', err);
      setError('Impossible de tout marquer comme lu');
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f5f7fb', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="md">
        {/* Bouton retour */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            position: 'absolute',
            top: 115,
            left: 300,
          }}
        >
          <IconButton
            onClick={() => navigate(-1)}
            size="large"
            sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: '50%',
            }}
          >
            <ArrowBack />
          </IconButton>
        </Box>

        <Box
          sx={{
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#001f6d' }}>
              Notifications
            </Typography>

            <Chip
              label={
                unreadCount > 0
                  ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
                  : 'Tout est lu'
              }
              color={unreadCount > 0 ? 'error' : 'success'}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={luTout}
              disabled={unreadCount === 0}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.2,
                fontWeight: 600,
                borderColor: '#001f6d',
                color: '#001f6d',
                '&:hover': {
                  borderColor: '#00154d',
                  backgroundColor: '#eef2ff',
                },
              }}
            >
              Tout marquer comme lu
            </Button>

            {userRole === 'ADMIN' && (
              <Button
                variant="contained"
                onClick={() => navigate('/notifications/create')}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1.2,
                  fontWeight: 600,
                  backgroundColor: '#001f6d',
                  '&:hover': {
                    backgroundColor: '#00154d',
                  },
                }}
              >
                Envoyer notification
              </Button>
            )}
          </Box>
        </Box>

        <Grid2 container spacing={3}>
          {error && (
            <Grid2 size={{ xs: 12 }}>
              <Typography color="error">{error}</Typography>
            </Grid2>
          )}

          {notifications.map((notification) => (
            <Grid2 size={{ xs: 12 }} key={notification.id}>
              <NotificationCard notification={notification} onMarkAsRead={lu} />
            </Grid2>
          ))}
        </Grid2>
      </Container>
    </Box>
  );
}

export default NotificationTab;
