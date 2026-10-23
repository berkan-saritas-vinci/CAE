import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Card,
  CardContent,
  Grid,
  Container,
} from '@mui/material';
import { Team } from '../../types';
import { useWelcome } from '../../hooks/useWelcome';

export default function WelcomePage() {
  const pendingUser = JSON.parse(
    sessionStorage.getItem('pendingUser') || 'null',
  );

  const {
    view,
    setView,
    teams,
    sentRequests,
    teamName,
    setTeamName,
    error,
    setError,
    success,
    handleRequest,
    handleCreateTeam,
  } = useWelcome(pendingUser?.id ?? 0);

  if (!pendingUser) {
    window.location.href = '/Register';
    return null;
  }

  if (view === 'list-team') {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Typography
          variant="h4"
          textAlign="center"
          sx={{ fontWeight: 600, color: '#001f6d', mb: 4 }}
        >
          Liste des équipes
        </Typography>

        <Grid container spacing={3}>
          {teams.map((team: Team) => {
            const requestSent = sentRequests.includes(team.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={team.id}>
                <Card sx={{ boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {team.name}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        py: 1.2,
                        borderRadius: 3,
                        fontWeight: 600,
                        background: requestSent
                          ? 'linear-gradient(135deg, #555, #777)'
                          : 'linear-gradient(135deg, #001f6d, #0033a0)',
                        color: '#fff',
                        '&:hover': {
                          background: requestSent
                            ? 'linear-gradient(135deg, #444, #666)'
                            : 'linear-gradient(135deg, #00154d, #002277)',
                        },
                      }}
                      onClick={() => handleRequest(team.id, team.name)}
                    >
                      {requestSent
                        ? 'Demande envoyée (cliquer pour annuler)'
                        : "Envoyer une demande d'adhésion"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
          <Button
            variant="outlined"
            sx={{ borderRadius: 3 }}
            onClick={() => setView('home')}
          >
            Retour
          </Button>
          {sentRequests.length > 0 && (
            <Button
              variant="contained"
              sx={{
                borderRadius: 3,
                py: 1.2,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #001f6d, #0033a0)',
                color: '#fff',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00154d, #002277)',
                },
              }}
              onClick={() => {
                sessionStorage.removeItem('pendingUser');
                window.location.href = '/Login';
              }}
            >
              J'ai terminé, me connecter
            </Button>
          )}
        </Box>
      </Container>
    );
  }

  if (view === 'create-team') {
    return (
      <Container maxWidth="sm" sx={{ py: 5 }}>
        <Box
          sx={{
            p: 4,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            borderRadius: 3,
            backgroundColor: 'white',
          }}
        >
          <Typography
            variant="h4"
            textAlign="center"
            sx={{ fontWeight: 600, color: '#001f6d', mb: 3 }}
          >
            Créer une équipe
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              Équipe créée ! Redirection...
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Nom de l'équipe"
            fullWidth
            value={teamName}
            onChange={(e) => {
              setTeamName(e.target.value);
              setError('');
            }}
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{
              py: 1.5,
              fontWeight: 600,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #001f6d, #0033a0)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #00154d, #002277)',
              },
            }}
            onClick={handleCreateTeam}
          >
            Créer l'équipe
          </Button>

          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2, borderRadius: 3 }}
            onClick={() => setView('home')}
          >
            Retour
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Box
        sx={{
          p: 4,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          borderRadius: 3,
          backgroundColor: 'white',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, color: '#001f6d', mb: 2 }}
        >
          Bienvenue {pendingUser.tag} !
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Votre compte a été créé. Que souhaitez-vous faire ?
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            sx={{
              py: 1.5,
              fontWeight: 600,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #001f6d, #0033a0)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #00154d, #002277)',
              },
            }}
            onClick={() => setView('list-team')}
          >
            Rejoindre une équipe
          </Button>
          <Button
            variant="contained"
            sx={{
              py: 1.5,
              fontWeight: 600,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #001f6d, #0033a0)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #00154d, #002277)',
              },
            }}
            onClick={() => setView('create-team')}
          >
            Créer une équipe
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
