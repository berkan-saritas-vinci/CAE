import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Container,
  Alert,
} from '@mui/material';
import { useNavigate, useOutletContext } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

import { MaybeAuthenticatedUser } from '../../types';
import { ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material';
import { useProfile } from '../../hooks/useProfile';
import { resolveAvatarPath } from '../../utils/avatarPaths';

const specialities = [
  'Architecte',
  'Exécuteur',
  'Tacticien',
  'Gardien',
  'Catalyseur',
  'Perturbateur',
  'Guérisseur',
];

interface ProfileContext {
  authenticatedUser: MaybeAuthenticatedUser;
}

const ProfilePage = () => {
  const { authenticatedUser } = useOutletContext<ProfileContext>();
  const navigate = useNavigate();
  const userId = authenticatedUser?.id;

  const {
    user,
    team,
    avatar,
    speciality,
    pictures,
    error,
    loadingProfile,
    formattedCreationDate,
    password,
    newPassword,
    showPassword,
    editPassword,
    editSpeciality,
    openAvatarDialog,
    fieldChecks,
    setPassword,
    setNewPassword,
    setShowPassword,
    setEditPassword,
    setEditSpeciality,
    setOpenAvatarDialog,
    onSpecialityChange,
    onAvatarSelect,
    onPasswordChange,
  } = useProfile(authenticatedUser);

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
        <Typography>
          {loadingProfile ? 'Chargement du profil...' : 'Profil introuvable'}
        </Typography>
      </Container>
    );
  }

  if (!userId) {
    return <Typography>Veuillez vous connecter.</Typography>;
  }

  return (
    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, width: 600 }}>
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
            src={resolveAvatarPath(avatar || user.picture)}
            sx={{ width: 150, height: 150, mb: 2 }}
          />
          {/* Ligne pour bouton + ✓ */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenAvatarDialog(true)}
            >
              Modifier image
            </Button>

            {fieldChecks.avatar && (
              <CheckIcon sx={{ color: 'green', fontSize: 22 }} />
            )}
          </Box>
        </Box>

        {/* Formulaire */}
        <TextField
          label="Date de création"
          value={formattedCreationDate}
          fullWidth
          disabled
          sx={{
            mb: 2,
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: '#333', // texte foncé mais doux
            },
            '& .MuiInputLabel-root.Mui-disabled': {
              color: '#555', // label légèrement foncé
            },
          }}
        />

        <TextField
          label="Tag"
          value={user.tag || ''}
          fullWidth
          disabled
          sx={{
            mb: 2,
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: '#333', // texte foncé mais doux
            },
            '& .MuiInputLabel-root.Mui-disabled': {
              color: '#555', // label légèrement foncé
            },
          }}
        />
        <TextField
          label="Adresse Mail"
          value={user.mail}
          fullWidth
          disabled
          sx={{
            mb: 3,
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: '#333', // texte foncé mais doux
            },
            '& .MuiInputLabel-root.Mui-disabled': {
              color: '#555', // label légèrement foncé
            },
          }}
        />

        {/* Mot de passe */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 3, mb: 2 }}>
          Sécurité
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
          {editPassword ? (
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Ancien mot de passe"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e: { target: { value: string } }) =>
                  setPassword(e.target.value)
                }
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />

              <TextField
                label="Nouveau mot de passe"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e: { target: { value: string } }) =>
                  setNewPassword(e.target.value)
                }
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={onPasswordChange}
                  startIcon={<CheckIcon />}
                >
                  Confirmer
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setEditPassword(false);
                    setPassword('');
                    setNewPassword('');
                  }}
                  startIcon={<CloseIcon />}
                >
                  Annuler
                </Button>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}
            >
              <TextField
                label="Mot de passe"
                value="••••••••"
                fullWidth
                disabled
                size="small"
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: '#333', // gris foncé lisible
                    color: '#333',
                  },
                  '& .MuiInputLabel-root.Mui-disabled': {
                    color: '#555', // label légèrement foncé
                  },
                }}
              />
              {fieldChecks.password && (
                <CheckIcon sx={{ color: 'green', fontSize: 22 }} />
              )}
              <IconButton
                data-testid="edit-password"
                color="primary"
                onClick={() => setEditPassword(true)}
                sx={{
                  bgcolor: '#f5f5f5',
                  '&:hover': { bgcolor: '#e0e0e0' },
                }}
              >
                <EditIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Spécialité */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {editSpeciality ? (
            <FormControl fullWidth>
              <InputLabel>Spécialité</InputLabel>
              <Select
                label="Spécialité"
                value={speciality}
                onChange={async (e: { target: { value: string } }) => {
                  const newSpec = e.target.value as string;
                  await onSpecialityChange(newSpec);
                }}
              >
                {specialities.map((spec) => (
                  <MenuItem key={spec} value={spec}>
                    {spec}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              label="Spécialité"
              value={user.speciality || 'Aucune'}
              fullWidth
              disabled
              size="medium"
              sx={{
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: '#333',
                  color: '#333',
                },
                '& .MuiInputLabel-root.Mui-disabled': {
                  color: '#555',
                },
              }}
            />
          )}

          {fieldChecks.speciality && (
            <CheckIcon sx={{ color: 'green', fontSize: 22 }} />
          )}

          <IconButton
            data-testid="edit-speciality"
            onClick={() => setEditSpeciality(true)} // juste ouvrir, pas toggle
            sx={{
              bgcolor: '#f5f5f5',
              '&:hover': { bgcolor: '#e0e0e0' },
            }}
          >
            <EditIcon />
          </IconButton>
        </Box>

        {/* Team */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label="Team"
            value={team || 'Aucune team'}
            disabled
            fullWidth
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#333', // texte foncé mais doux
              },
              '& .MuiInputLabel-root.Mui-disabled': {
                color: '#555', // label légèrement foncé
              },
            }}
          />

          <IconButton onClick={() => navigate('/team')}>
            <EditIcon />
          </IconButton>
        </Box>
        {/* POPUP AVATAR */}
        <Dialog
          open={openAvatarDialog}
          onClose={() => setOpenAvatarDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden',
            },
          }}
        >
          <DialogTitle
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              borderBottom: '1px solid #eee',
            }}
          >
            Choisir une image de profil
          </DialogTitle>

          <DialogContent
            sx={{
              borderTop: 'none',
              pt: 3,
              pb: 3,
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 2,
                justifyItems: 'center',
                mt: 2,
              }}
            >
              {pictures.map((pic: { id: number; link: string }) => (
                <Avatar
                  key={pic.id}
                  src={resolveAvatarPath(pic.link)}
                  onClick={async () => {
                    const selected = pic.link;
                    await onAvatarSelect(selected);
                  }}
                  sx={{
                    width: 70,
                    height: 70,
                    cursor: 'pointer',
                    border:
                      avatar === pic.link
                        ? '3px solid #1976d2'
                        : '2px solid transparent',
                    transition: '0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: 3,
                    },
                  }}
                />
              ))}
            </Box>
          </DialogContent>
        </Dialog>
      </Paper>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start', // Aligner les éléments en haut
          gap: 3, // Espacement entre les sections
          mt: 10, // Marge supérieure pour espacer du contenu précédent
        }}
      >
        {/* Boutons alignés à droite de la page */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column', // Empile les boutons verticalement
            gap: 2, // Espacement entre les boutons
            width: '250px', // Largeur fixe pour la colonne des boutons
            marginLeft: 4,
          }}
        >
          <Button
            variant="contained"
            onClick={() => navigate('/team')}
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
            Ma team
          </Button>

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
            Mes matchs
          </Button>

          <Button
            variant="contained"
            onClick={() => navigate('/Mytournaments')}
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
            Mes tournois
          </Button>

          <Button
            variant="contained"
            onClick={() => navigate('/indisponibilities')}
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
            Mes indisponibilités
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;
