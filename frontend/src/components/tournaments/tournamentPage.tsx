import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { LoginContext } from '../../types';
import {
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useTournamentPage } from '../../hooks/tournaments/useTournamentPage';

// Page décrivant un tournoi
const TournamentPage = () => {
  const { tournamentId } = useParams();
  const { authenticatedUser } = useOutletContext<LoginContext>();
  const navigate = useNavigate();
  const {
    tournament,
    teams,
    isTeamResponsible,
    isRegistrationDeadlinePassed,
    registeredTeams,
    statusColors,
  } = useTournamentPage(tournamentId, authenticatedUser);

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Stack direction="column" spacing={3} sx={{ width: '100%' }}>
        <Box />

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          sx={{ width: '100%' }}
        >
          <Box
            sx={{
              flex: 2,
              p: 5,
              borderRadius: 4,
              backdropFilter: 'blur(10px)',
              background: 'linear-gradient(145deg, #ffffff, #f5f7ff)',
              boxShadow: '0 15px 40px rgba(0,0,0,0.08)',
              transition: '0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
              },
            }}
          >
            {!tournament ? (
              <Typography color="error">Erreur de récupération...</Typography>
            ) : (
              <>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
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
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: '#001f6d',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {tournament.nom}
                    </Typography>
                  </Stack>

                  <Stack direction="column" alignItems="flex-end" spacing={1}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        backgroundColor:
                          statusColors[tournament.etat]?.bg || '#f5f7ff',
                        color:
                          statusColors[tournament.etat]?.color || '#0d47a1',
                        fontSize: '0.9rem',
                        transition: '0.2s',
                        '&:hover': {
                          opacity: 0.85,
                        },
                      }}
                    >
                      {tournament.etat}
                    </Typography>
                  </Stack>
                </Stack>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    mb: 4,
                    lineHeight: 1.6,
                  }}
                >
                  {tournament.description}
                </Typography>

                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Box sx={{ mt: 2 }}>
                    <Stack spacing={2}>
                      {tournament.etat === 'TERMINE' && (
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 3,
                            fontWeight: 700,
                            color: '#001f6d',
                          }}
                        >
                          Gagnant : {tournament.gagnant?.name ?? 'Non défini'}
                        </Typography>
                      )}
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Date de début
                        </Typography>
                        <Typography fontWeight={500}>
                          {new Date(tournament.date_debut).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Date de fin
                        </Typography>
                        <Typography fontWeight={500}>
                          {new Date(tournament.date_fin).toLocaleDateString()}
                        </Typography>
                      </Box>

                      {tournament.etat === 'INSCRIPTION_OUVERTE' && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Date limite d'inscription
                          </Typography>
                          <Typography
                            fontWeight={500}
                            sx={{
                              color: isRegistrationDeadlinePassed(
                                tournament.date_fin_inscription,
                              )
                                ? '#c62828'
                                : '#2e7d32',
                            }}
                          >
                            {new Date(
                              tournament.date_fin_inscription,
                            ).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Teams inscrites
                        </Typography>
                        <Typography fontWeight={500}>
                          {registeredTeams}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Places restantes
                        </Typography>
                        <Typography fontWeight={500}>
                          {Math.max(0, tournament.nbrTeam - registeredTeams)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                  <Button
                    variant="contained"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '10px',
                      px: 3,
                      background:
                        'linear-gradient(135deg, #1976d2 0%, #4791db 100%)',
                    }}
                    onClick={() =>
                      navigate(`/tournamentMatches/${tournament.id}`)
                    }
                  >
                    Matches
                  </Button>

                  {isTeamResponsible &&
                    tournament.etat === 'INSCRIPTION_OUVERTE' &&
                    tournament.nbrTeam - registeredTeams > 0 && (
                      <Button
                        variant="contained"
                        onClick={() => navigate('/registerTeamTournament')}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: '10px',
                          px: 3,
                          background:
                            'linear-gradient(135deg, #1976d2, #42a5f5)',
                          boxShadow: '0 8px 20px rgba(25,118,210,0.3)',
                          '&:hover': {
                            background:
                              'linear-gradient(135deg, #1565c0, #1e88e5)',
                          },
                        }}
                      >
                        S'inscrire
                      </Button>
                    )}
                </Stack>
              </>
            )}
          </Box>

          <Box
            sx={{
              flex: 1,
              p: 3,
              borderRadius: 4,
              background: 'linear-gradient(145deg, #ffffff, #f9fbff)',
              boxShadow: '0 15px 40px rgba(0,0,0,0.08)',
              maxHeight: '520px',
              overflowY: 'auto',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 700,
                color: '#001f6d',
              }}
            >
              Teams inscrites
            </Typography>

            {teams.length === 0 ? (
              <Typography color="text.secondary">
                Aucune équipe inscrite
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {teams.map((team) => (
                  <Box
                    key={team.id}
                    onClick={() =>
                      navigate(`/publicTeam/${team.id}`, { state: { team } })
                    }
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#f5f7ff',
                      transition: '0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Typography fontWeight={500}>
                      {team.name ?? `Team #${team.id}`}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
};

export default TournamentPage;
