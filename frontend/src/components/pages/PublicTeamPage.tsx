import {
  Box,
  Typography,
  Avatar,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTeam } from '../../hooks/useTeam';
import { resolveAvatarPath } from '../../utils/avatarPaths';

// Type local pour gérer l'affichage des images
type PublicTeamMember = {
  id: number;
  tag?: string;
  mail: string;
  role: string;
  speciality?: { name: string };
  picture?: string | { link: string };
};

const PublicTeamPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getPictureLink = (picture: string | { link: string } | undefined) =>
    resolveAvatarPath(
      typeof picture === 'string' ? picture : (picture?.link ?? ''),
    );

  // Hook existant
  const { team, responsableNom, secondResponsableNom, membres } =
    useTeam(undefined);

  const displayedTeam = location.state?.team || team;

  if (!displayedTeam) {
    return (
      <Container sx={{ mt: 5 }}>
        <Typography>Chargement de la team...</Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
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
          gap: 2,
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
          Team : {displayedTeam.name}
        </Typography>

        <Typography>
          <strong>Responsable :</strong> {responsableNom}
        </Typography>

        <Typography>
          <strong>Second responsable :</strong>{' '}
          {secondResponsableNom || 'Aucun second responsable'}
        </Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Membres
        </Typography>

        {membres.length === 0 ? (
          <Typography color="text.secondary">
            Aucun membre pour le moment.
          </Typography>
        ) : (
          <List
            sx={{
              border: '1px solid #eee',
              borderRadius: 2,
            }}
          >
            {(membres as PublicTeamMember[]).map((membre) => (
              <Box key={membre.id}>
                <ListItem
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/publicPage/${membre.id}`)}
                >
                  <Avatar src={getPictureLink(membre.picture)} sx={{ mr: 2 }} />

                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography>{membre.tag || membre.mail}</Typography>

                        {/* Badge ADMIN */}
                        {membre.role === 'ADMIN' && (
                          <Box
                            sx={{
                              backgroundColor: 'black',
                              color: 'red',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              px: 1,
                              height: '22px',
                              borderRadius: '6px',
                              fontSize: '0.65rem',
                              fontWeight: 'bold',
                            }}
                          >
                            ADMIN
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>

                <Divider />
              </Box>
            ))}
          </List>
        )}
      </Box>
    </Container>
  );
};

export default PublicTeamPage;
