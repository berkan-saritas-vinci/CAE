import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../types';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (notificationId: number) => Promise<void>;
}

function NotificationCard({
  notification,
  onMarkAsRead,
}: NotificationCardProps) {
  const navigate = useNavigate();

  const actionButtonSx = {
    borderRadius: 2,
    fontWeight: 600,
    backgroundColor: '#001f6d',
    '&:hover': {
      backgroundColor: '#00154d',
    },
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        borderLeft: `6px solid ${notification.lu ? '#cfd8dc' : '#001f6d'}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: notification.lu ? 'text.secondary' : '#001f6d',
          }}
        >
          {notification.message}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={notification.lu ? 'Lu' : 'Non lu'}
              color={notification.lu ? 'success' : 'error'}
              size="small"
              sx={{ fontWeight: 600 }}
            />

            <Button
              variant="contained"
              disabled={notification.lu}
              onClick={() => onMarkAsRead(notification.id)}
              sx={actionButtonSx}
            >
              Marquer comme lu
            </Button>
          </Box>

          {notification.message.includes('veut rejoindre la team') && (
            <Box>
              <Button
                variant="contained"
                onClick={() => navigate('/demandes')}
                sx={actionButtonSx}
              >
                Demandes
              </Button>
            </Box>
          )}

          {notification.message.includes(
            "a accepté votre demande d'adhésion",
          ) && (
            <Box>
              <Button
                variant="contained"
                onClick={() => navigate('/team')}
                sx={actionButtonSx}
              >
                Ma team
              </Button>
            </Box>
          )}

          {notification.message.includes(
            "a refusé votre demande d'adhésion",
          ) && (
            <Box>
              <Button
                variant="contained"
                onClick={() => navigate('/team')}
                sx={actionButtonSx}
              >
                Faire une nouvelle demande
              </Button>
            </Box>
          )}

          {notification.message.includes(
            'Votre équipe est inscrite à un nouveau tournoi :',
          ) && (
            <Box>
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                sx={actionButtonSx}
              >
                Page tournois
              </Button>
            </Box>
          )}

          {notification.message.includes(
            "Un nouveau tournoi est publié! Allez sur la page d'inscription pour vous y inscrire!!!",
          ) && (
            <Box>
              <Button
                variant="contained"
                onClick={() => navigate('/registerTeamTournament')}
                sx={actionButtonSx}
              >
                Inscription tournoi
              </Button>
            </Box>
          )}

          {notification.message.includes(
            'Un nouveau tournois est pret à être publié.',
          ) && (
            <Box>
              <Button
                variant="contained"
                onClick={() => navigate('/publishTournamentPage')}
                sx={actionButtonSx}
              >
                Création de tournoi
              </Button>
            </Box>
          )}

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {new Date(notification.date).toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default NotificationCard;
