import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import { LoginContext } from '../../types';
import { useTeamsList } from '../../hooks/useTeamsList';

export default function TeamsListPage() {
  const { authenticatedUser } = useOutletContext<LoginContext>();
  const userId = authenticatedUser?.id;
  const { teams, sentRequests, handleRequest } = useTeamsList(userId);

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          p: 4,
        }}
      >
        <Box textAlign="center">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: '#001f6d',
            }}
          >
            Liste des équipes
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Rejoignez une équipe en envoyant une demande
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {teams.map((team) => {
            const requestSent = sentRequests.includes(team.id);

            return (
              <Grid item xs={12} sm={6} md={4} key={team.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    height: '100%',
                  }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 600, color: '#001f6d' }}
                      >
                        {team.name}
                      </Typography>

                      <Typography sx={{ mt: 1 }}>
                        Responsable : {team.responsable}
                      </Typography>

                      {team.secondResponsable && (
                        <Typography>
                          Second responsable : {team.secondResponsable}
                        </Typography>
                      )}
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleRequest(team.id, team.name)}
                      sx={{
                        mt: 2,
                        py: 1.3,
                        fontWeight: 600,
                        borderRadius: 3,
                        background: requestSent
                          ? 'linear-gradient(135deg, #6c757d, #495057)'
                          : 'linear-gradient(135deg, #001f6d, #0033a0)',
                        '&:hover': {
                          background: requestSent
                            ? 'linear-gradient(135deg, #5a6268, #343a40)'
                            : 'linear-gradient(135deg, #00154d, #002277)',
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      {requestSent
                        ? 'Demande envoyée (annuler)'
                        : 'Envoyer une demande'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Container>
  );
}
