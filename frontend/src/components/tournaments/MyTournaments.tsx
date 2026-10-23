import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { LoginContext, Tournament } from '../../types';
import { useMyTournaments } from '../../hooks/tournaments/useMyTournaments';
import { useTournamentPage } from '../../hooks/tournaments/useTournamentPage';

const MyTournaments = () => {
  const navigate = useNavigate();
  const { authenticatedUser } = useOutletContext<LoginContext>();
  const { tournaments, loading, error } = useMyTournaments(authenticatedUser);
  const { statusColors } = useTournamentPage(undefined, authenticatedUser);
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR');

  return (
    <Container maxWidth="md" sx={{ py: 5, position: 'relative' }}>
      {/* HEADER */}
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
          Mes tournois
        </Typography>
      </Box>

      {/* STATES */}
      {loading && (
        <Typography textAlign="center" sx={{ mt: 4 }}>
          Chargement...
        </Typography>
      )}

      {error && (
        <Typography textAlign="center" color="error" sx={{ mt: 4 }}>
          {error}
        </Typography>
      )}

      {/* LISTE */}
      <Stack spacing={3}>
        {tournaments
          .sort(
            (a: Tournament, b: Tournament) =>
              new Date(b.date_debut).getTime() -
              new Date(a.date_debut).getTime(),
          )
          .map((t: Tournament) => (
            <Card
              key={t.id}
              onClick={() => navigate(`/tournamentmatches/${t.id}`)}
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
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  {/* INFOS */}
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {t.nom}
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight: 600,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          backgroundColor:
                            statusColors[t.etat]?.bg || '#f5f7ff',
                          color: statusColors[t.etat]?.color || '#0d47a1',
                          fontSize: '0.8rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t.etat}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', mb: 2 }}
                    >
                      {t.description}
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          backgroundColor: '#f5f7fb',
                          fontSize: '0.75rem',
                        }}
                      >
                        Début : {formatDate(t.date_debut)}
                      </Box>

                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          backgroundColor: '#f5f7fb',
                          fontSize: '0.75rem',
                        }}
                      >
                        Fin : {formatDate(t.date_fin)}
                      </Box>

                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          backgroundColor: '#f5f7fb',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                      >
                        Inscription : {formatDate(t.date_fin_inscription)}
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
      </Stack>
    </Container>
  );
};

export default MyTournaments;
