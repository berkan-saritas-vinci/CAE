import { useOutletContext } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { LoginContext } from '../../types';
import CloseIcon from '@mui/icons-material/Close';
import { useNotificationCreatePage } from '../../hooks/useNotificationCreatePage';
import NotificationRecipientSelector from './NotificationUserSelector';

const NotificationCreatePage = () => {
  const { authenticatedUser } = useOutletContext<LoginContext>();

  const {
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
  } = useNotificationCreatePage(authenticatedUser);

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Vous devez être connecté pour créer une notification.
        </Alert>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            position: 'absolute',
            top: 125,
            left: 120,
          }}
        >
          <IconButton
            onClick={goBack}
            size="large"
            sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: '50%',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Alert severity="error">
          Seul un administrateur peut créer des notifications.
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          p: 5,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          borderRadius: 3,
          backgroundColor: 'white',
        }}
      >
        <Typography
          variant="h4"
          textAlign="center"
          sx={{
            fontWeight: 600,
            color: '#001f6d',
          }}
        >
          Création de notification
        </Typography>

        <Typography
          variant="body2"
          textAlign="center"
          sx={{ color: 'text.secondary' }}
        >
          Message de la notification et Tag de l'utilisateur destinataire sont
          requis.
        </Typography>

        <TextField
          label="Message"
          variant="outlined"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          fullWidth
          multiline
          minRows={3}
          InputLabelProps={{ shrink: true }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        <NotificationRecipientSelector
          users={users}
          loadingUsers={loadingUsers}
          inputValue={inputValue}
          setInputValue={setInputValue}
          targetUserId={targetUserId}
          setTargetUserId={setTargetUserId}
          selectedUser={selectedUser}
        />

        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={goToNotifications}
            disabled={isSubmitting}
          >
            Retour
          </Button>
          <Button
            variant="contained"
            type="submit"
            fullWidth
            disabled={isSubmitting}
            sx={{
              fontWeight: 600,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #001f6d, #0033a0)',
              '&:hover': {
                background: 'linear-gradient(135deg, #00154d, #002277)',
              },
            }}
          >
            {isSubmitting ? 'Envoi...' : 'Envoyer'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotificationCreatePage;
