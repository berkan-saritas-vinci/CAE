import {
  Box,
  Paper,
  Typography,
  Avatar,
  Container,
  Alert,
  TextField,
  IconButton,
  Button,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { usePublicProfile } from '../../hooks/usePublicProfile';
import type { PublicUser } from '../../services/publicProfile.service';
import { resolveAvatarPath } from '../../utils/avatarPaths';

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const { user, team, error } = usePublicProfile(userId);

  const getPictureLink = (picture: PublicUser['picture']) =>
    resolveAvatarPath(
      typeof picture === 'string' ? picture : (picture?.link ?? ''),
    );

  if (error) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ mt: 5 }}>
        <Typography>Chargement du profil...</Typography>
      </Container>
    );
  }

  const formattedCreationDate = user.createdAt
    ? (() => {
        const parsedDate = new Date(user.createdAt);
        return Number.isNaN(parsedDate.getTime())
          ? user.createdAt
          : parsedDate.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
      })()
    : 'Date inconnue';

  return (
    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, width: 600, position: 'relative' }}>
        {/* Bouton retour */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            position: 'fixed',
            top: 115,
            left: { xs: 16, md: 300 },
            zIndex: 1200,
          }}
        >
          <IconButton
            onClick={() => navigate(-1)}
            size="large"
            sx={{ backgroundColor: '#f5f5f5', borderRadius: '50%' }}
          >
            <ArrowBack />
          </IconButton>
        </Box>

        <Typography variant="h4" align="center" gutterBottom>
          Profil
        </Typography>

        {/* Avatar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Avatar
            src={getPictureLink(user.picture)}
            sx={{ width: 150, height: 150, mb: 2 }}
          />
        </Box>

        {/* Champs */}
        <TextField
          label="Date de création"
          value={formattedCreationDate}
          fullWidth
          disabled
          sx={{ mb: 2 }}
        />

        <TextField
          label="Tag"
          value={user.tag}
          fullWidth
          disabled
          sx={{ mb: 2 }}
        />

        <TextField
          label="Spécialité"
          value={user.speciality}
          fullWidth
          disabled
          sx={{ mb: 2 }}
        />

        <TextField
          label="Team"
          value={team}
          fullWidth
          disabled
          sx={{ mb: 2 }}
        />

        {/* Rôle */}
        {user.role === 'USER' && (
          <TextField
            label="Role"
            value={user.role}
            fullWidth
            disabled
            sx={{ mb: 2 }}
          />
        )}

        {user.role === 'BANNED' && (
          <Box
            sx={{
              backgroundColor: 'red',
              color: 'white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '120px',
              height: '32px',
              mx: 'auto',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              mt: 3,
            }}
          >
            BANNI
          </Box>
        )}

        {user.role === 'ADMIN' && (
          <Box
            sx={{
              backgroundColor: 'black',
              color: 'red',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '120px',
              height: '32px',
              mx: 'auto',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              mt: 3,
            }}
          >
            ADMIN
          </Box>
        )}
        <Box>
          <Button
            variant="contained"
            onClick={() => navigate(`/matches/${userId}`)}
            size="large"
            sx={{
              py: 1.5,
              fontWeight: 600,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #001f6d, #0033a0)',
              color: '#fff',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #00154d, #002277)',
                transform: 'scale(1.05)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
            }}
          >
            Matchs
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PublicProfile;
