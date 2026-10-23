import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { useMatchUser } from '../../hooks/useMatchUser';

export function MatchUser() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { matches, isLoading, error } = useMatchUser(userId);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Chargement des matchs...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (matches.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Aucun match trouvé pour cet utilisateur.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 5, position: 'relative' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 4,
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            backgroundColor: 'white',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
            '&:hover': {
              backgroundColor: '#f5f7fb',
            },
          }}
        >
          <ArrowBack />
        </IconButton>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#001f6d',
            letterSpacing: '-0.5px',
          }}
        >
          Mes matchs
        </Typography>
      </Box>

      {/* LISTE */}
      <Grid container spacing={3}>
        {matches
          .sort(
            (a, b) =>
              new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
          )
          .map((match) => (
            <Grid item xs={12} key={match.id}>
              <Card
                onClick={() =>
                  navigate(
                    `/tournamentmatches/${match.tournament.id}/match/${match.id}`,
                  )
                }
                sx={{
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.08)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box>
                    {/* Titre et Status badge sur la même ligne */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        mb: 1.5,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {match.team1?.name} vs {match.team2?.name}
                      </Typography>

                      {/* Status badge */}
                      <Box
                        sx={{
                          px: 2,
                          py: 0.6,
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          backgroundColor:
                            match.status === 'PLANNED'
                              ? '#e3f2fd'
                              : match.status === 'TERMINED'
                                ? '#fff3e0'
                                : match.status === 'CONTESTED'
                                  ? '#ffebee'
                                  : '#e8f5e9',
                          color:
                            match.status === 'PLANNED'
                              ? '#1565c0'
                              : match.status === 'TERMINED'
                                ? '#ef6c00'
                                : match.status === 'CONTESTED'
                                  ? '#c62828'
                                  : '#2e7d32',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {match.status === 'PLANNED'
                          ? 'PLANIFIÉ'
                          : match.status === 'TERMINED'
                            ? 'TERMINÉ'
                            : match.status === 'CONTESTED'
                              ? 'CONTESTÉ'
                              : match.status === 'VALIDATE_BY'
                                ? 'VALIDÉ'
                                : match.status === 'FINISHED'
                                  ? 'CLOS'
                                  : match.status}
                      </Box>
                    </Box>

                    {/* Autres infos */}
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                      >
                        {match.tournament.nom}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                      >
                        {new Date(match.dateTime).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>

                      {match.administrator?.tag && (
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary' }}
                        >
                          Arbitre: {match.administrator?.tag}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Container>
  );
}

export default MatchUser;
