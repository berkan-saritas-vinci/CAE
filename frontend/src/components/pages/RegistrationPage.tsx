import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useRegister } from '../../hooks/useRegister';
import {
  AVATAR_STORAGE_PATHS,
  resolveAvatarPath,
} from '../../utils/avatarPaths';

const specialities = [
  'Architecte',
  'Exécuteur',
  'Tacticien',
  'Gardien',
  'Catalyseur',
  'Perturbateur',
  'Guérisseur',
];

const RegisterPage = () => {
  useOutletContext();

  const navigate = useNavigate();

  const {
    picture,
    setPicture,
    mail,
    password,
    tag,
    speciality,
    setSpeciality,
    showPassword,
    setShowPassword,
    openAvatarDialog,
    setOpenAvatarDialog,
    mailError,
    passwordError,
    handleSubmit,
    handleMailInputChange,
    handlePasswordInputChange,
    handleTagInputChange,
  } = useRegister();

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
          position: 'absolute',
          top: 40,
          left: 40,
        }}
      ></Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
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
          Inscription
        </Typography>

        <Typography
          variant="body2"
          textAlign="center"
          sx={{ color: 'text.secondary', mb: 1 }}
        >
          Créez votre compte pour commencer
        </Typography>

        <TextField
          label="Adresse mail"
          value={mail}
          onChange={handleMailInputChange}
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        <TextField
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={handlePasswordInputChange}
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Tag + Spécialité */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Tag"
            value={tag}
            onChange={handleTagInputChange}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <FormControl fullWidth required>
            <InputLabel>Spécialité</InputLabel>
            <Select
              value={speciality}
              label="Spécialité"
              onChange={(e) => setSpeciality(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              {specialities.map((spec) => (
                <MenuItem key={spec} value={spec}>
                  {spec}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Avatar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            mt: 1,
          }}
        >
          <Avatar
            src={resolveAvatarPath(picture)}
            sx={{
              width: 70,
              height: 70,
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            }}
          />

          <Button
            variant="outlined"
            onClick={() => setOpenAvatarDialog(true)}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              minWidth: 160,
            }}
          >
            Choisir un avatar
          </Button>
        </Box>

        {mailError && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {mailError}
          </Alert>
        )}

        {passwordError && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {passwordError}
          </Alert>
        )}

        <Button
          variant="contained"
          type="submit"
          size="medium"
          sx={{
            mt: 1,
            py: 1.2,
            fontWeight: 600,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #001f6d, #0033a0)',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #00154d, #002277)',
              transform: 'scale(1.03)',
            },
          }}
        >
          Étape suivante
        </Button>

        <Typography textAlign="center" variant="body2">
          Déjà un compte ?{' '}
          <Button
            variant="text"
            size="small"
            onClick={() => navigate('/login')}
          >
            Se connecter
          </Button>
        </Typography>
      </Box>

      {/* Popup Avatar */}
      <Dialog
        open={openAvatarDialog}
        onClose={() => setOpenAvatarDialog(false)}
      >
        <DialogTitle>Choisir une image de profil</DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'center',
              p: 1,
            }}
          >
            {AVATAR_STORAGE_PATHS.map((avatarPath) => (
              <Avatar
                key={avatarPath}
                src={resolveAvatarPath(avatarPath)}
                sx={{
                  width: 90,
                  height: 90,
                  cursor: 'pointer',
                  transition: '0.2s',
                  '&:hover': {
                    transform: 'scale(1.08)',
                  },
                }}
                onClick={() => {
                  setPicture(avatarPath);
                  setOpenAvatarDialog(false);
                }}
              />
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default RegisterPage;
