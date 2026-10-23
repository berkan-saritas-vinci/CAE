import { useNavigate, useOutletContext } from 'react-router-dom';
import { LoginContext } from '../../types';
import {
  Typography,
  Box,
  Button,
  Divider,
  Container,
  IconButton,
  Avatar,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { ChevronRight } from '@mui/icons-material';
import { useTeam } from '../../hooks/useTeam';
import { PublicUser } from '../../services/publicProfile.service';
import { resolveAvatarPath } from '../../utils/avatarPaths';

export default function TeamPage() {
  const navigate = useNavigate();
  const { authenticatedUser: user } = useOutletContext<LoginContext>();
  const {
    team,
    loading,
    responsableNom,
    secondResponsableNom,
    secondResponsableId,
    membres,
    handleQuitTeam,
    handleNommerSecond,
    handleExcludeMember,
  } = useTeam(user);
  const getPictureLink = (picture: PublicUser['picture']) =>
    resolveAvatarPath(
      typeof picture === 'string' ? picture : (picture?.link ?? ''),
    );

  if (!user) {
    return null;
  }

  // Afficher un contenu vide pendant le chargement
  if (loading) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    );
  }

  const isResponsable =
    !!user && !!team && user.id === Number(team.responsable);

  if (!team) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
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
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            p: 4,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            borderRadius: 3,
            backgroundColor: 'white',
          }}
        >
          <Typography
            variant="h4"
            textAlign="center"
            sx={{ fontWeight: 600, color: '#001f6d' }}
          >
            Ma team
          </Typography>

          <Typography textAlign="center" color="text.secondary">
            Vous ne faites partie d'aucune team
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate('/listTeam')}
            sx={{
              py: 1.2,
              borderRadius: 3,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #001f6d, #0033a0)',
              '&:hover': {
                background: 'linear-gradient(135deg, #00154d, #002277)',
              },
            }}
          >
            Rejoindre une team
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate('/createTeam')}
            sx={{ borderRadius: 3 }}
          >
            Créer une team
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: '100vh',
        py: 4,
      }}
    >
      {/* Bouton retour */}
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
            backgroundColor: '#001f6d',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0,31,109,0.85)',
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
          }}
        >
          Ma team
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 3 }}>
        {/* Section principale - Infos team et membres */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {/* Infos team */}
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: 'white',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              borderTop: '4px solid #001f6d',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#001f6d',
                mb: 2,
              }}
            >
              Informations
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography>
                <strong>Nom :</strong> {team.name}
              </Typography>

              <Typography>
                <strong>Responsable :</strong>{' '}
                {responsableNom || team.responsable}
              </Typography>

              <Typography>
                <strong>Second responsable :</strong>{' '}
                {team.secondResponsable && Number(team.secondResponsable) !== 0
                  ? secondResponsableNom || team.secondResponsable
                  : 'Aucun second responsable'}
              </Typography>
            </Box>
          </Box>

          {/* Membres */}
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: 'white',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#001f6d',
                mb: 2,
              }}
            >
              Membres ({membres.length})
            </Typography>

            {membres.length === 0 ? (
              <Typography color="text.secondary">
                Aucun membre pour le moment.
              </Typography>
            ) : (
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid #e0e0e0',
                }}
              >
                {membres.map((membre, index) => (
                  <Box key={membre.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
                        padding: '12px 16px',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        borderLeft: '4px solid transparent',
                        '&:hover': {
                          backgroundColor: '#f0f4ff',
                          borderLeft: '4px solid #001f6d',
                          transform: 'translateX(4px)',
                        },
                      }}
                      onClick={() => navigate(`/publicPage/${membre.id}`)}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          flex: 1,
                        }}
                      >
                        <Avatar
                          src={getPictureLink(membre.picture)}
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: '#001f6d',
                            color: 'white',
                            fontWeight: 600,
                          }}
                        >
                          {(!getPictureLink(membre.picture) &&
                            (membre.tag || membre.mail)?.[0]?.toUpperCase()) ||
                            'U'}
                        </Avatar>

                        <Box>
                          <Typography
                            sx={{ fontWeight: 600, color: '#001f6d' }}
                          >
                            {membre.tag || membre.mail}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            {membre.speciality?.name || ''}{' '}
                            {membre.speciality?.name && '-'} {membre.role}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {isResponsable && membre.id !== user!.id && (
                          <Box
                            sx={{ display: 'flex', gap: 1 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: '#001f6d',
                                color: '#001f6d',
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                '&:hover': {
                                  backgroundColor: 'rgba(0,31,109,0.08)',
                                },
                              }}
                              disabled={
                                secondResponsableId !== null &&
                                secondResponsableId !== 0
                              }
                              onClick={() =>
                                handleNommerSecond(membre.id, user.token)
                              }
                            >
                              {secondResponsableId === membre.id
                                ? 'Second responsable ✓'
                                : 'Nommer second responsable'}
                            </Button>

                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              sx={{
                                textTransform: 'none',
                                fontSize: '0.75rem',
                              }}
                              onClick={async () => {
                                if (window.confirm('Exclure ce membre ?')) {
                                  await handleExcludeMember(
                                    membre.id,
                                    user.token,
                                  );
                                }
                              }}
                            >
                              Exclure
                            </Button>
                          </Box>
                        )}
                        <ChevronRight sx={{ color: '#001f6d', ml: 1 }} />
                      </Box>
                    </Box>

                    {index < membres.length - 1 && (
                      <Divider sx={{ margin: 0 }} />
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Section actions - Colonne latérale */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: 'white',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {isResponsable && (
              <Button
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: '#001f6d',
                  color: '#001f6d',
                  fontSize: '0.9rem',
                  '&:hover': {
                    backgroundColor: 'rgba(0,31,109,0.08)',
                  },
                }}
                onClick={() => navigate('/demandes')}
              >
                Demandes d'adhésion
              </Button>
            )}

            {user && team && user.id === Number(team.responsable) && (
              <Button
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: '#001f6d',
                  color: '#001f6d',
                  fontSize: '0.9rem',
                  '&:hover': {
                    backgroundColor: 'rgba(0,31,109,0.08)',
                  },
                }}
                onClick={() => navigate('/registerTeamTournament')}
              >
                Nos tournois
              </Button>
            )}

            <Button
              variant="contained"
              color="error"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.9rem',
              }}
              onClick={async () => {
                await handleQuitTeam(user!.token);
                alert('Vous avez quitté la team !');
              }}
            >
              Quitter la team
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
