import { useState, SyntheticEvent } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Alert,
} from '@mui/material';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import { LoginContext } from '../../types';
import { useLogin } from '../../hooks/useLogin';

const LoginPage = () => {
  const { loginUser }: LoginContext = useOutletContext();

  const { handleLogin, mailError, setMailError, loginError, setLoginError } =
    useLogin(loginUser);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    const success = await handleLogin(mail, password, rememberMe);

    if (success) {
      navigate('/');
    }
  };

  const handleMailInputChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setMail(input.value);
    setMailError('');
  };

  const handlePasswordChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setPassword(input.value);
    setLoginError('');
  };

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
            mb: 1,
          }}
        >
          Connexion
        </Typography>

        <Typography
          variant="body2"
          textAlign="center"
          sx={{ color: 'text.secondary', mb: 2 }}
        >
          Connectez-vous pour accéder à votre compte
        </Typography>

        <TextField
          label="Adresse mail"
          value={mail}
          onChange={handleMailInputChange}
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <TextField
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={handlePasswordChange}
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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

        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              sx={{
                color: '#001f6d',
                '&.Mui-checked': { color: '#001f6d' },
              }}
            />
          }
          label="Se souvenir de moi"
        />

        {loginError && <Alert severity="error">{loginError}</Alert>}

        {mailError && <Alert severity="error">{mailError}</Alert>}

        <Button
          variant="contained"
          type="submit"
          size="large"
          sx={{
            mt: 1,
            py: 1.5,
            fontWeight: 600,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #001f6d, #0033a0)',
            '&:hover': {
              background: 'linear-gradient(135deg, #00154d, #002277)',
              transform: 'scale(1.05)',
            },
          }}
        >
          Se connecter
        </Button>
      </Box>
    </Container>
  );
};

export default LoginPage;
