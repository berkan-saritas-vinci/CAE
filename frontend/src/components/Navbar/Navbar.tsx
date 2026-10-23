import logo from '../../assets/logos/rito.jpg';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  Badge,
  Avatar,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { useProfile } from '../../hooks/useProfile';
import { useNotifications } from '../../hooks/useNotifications';
import { useAdminMode } from '../../hooks/useAdminMode';
import { useEffect } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import { MaybeAuthenticatedUser } from '../../types';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import Logout from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { resolveAvatarPath } from '../../utils/avatarPaths';

interface NavBarProps {
  authenticatedUser: MaybeAuthenticatedUser;
  clearUser: () => void;
}

const NavBar = ({ authenticatedUser, clearUser }: NavBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { loadingProfile, user } = useProfile(authenticatedUser);

  const { hasUnreadNotifications } = useNotifications(
    authenticatedUser?.token,
    authenticatedUser?.id,
    location.pathname,
  );

  const { isAdminMode, toggleAdminMode, disableAdminMode } = useAdminMode();

  const isOriginalAdmin = authenticatedUser?.role === 'ADMIN';

  // Réinitialiser le mode admin quand l'utilisateur change
  useEffect(() => {
    // Si l'utilisateur est authentifié ET n'est pas admin, désactiver le mode admin
    if (authenticatedUser && !isOriginalAdmin) {
      disableAdminMode();
    }
  }, [
    authenticatedUser?.id,
    isOriginalAdmin,
    disableAdminMode,
    authenticatedUser,
  ]);

  return (
    <AppBar position="static" sx={{ backgroundColor: '#001f6d' }}>
      <Toolbar>
        <Box display="flex" alignItems="center" flexGrow={1}>
          <img
            src={logo}
            alt="rito games logo"
            style={{ height: 40, marginRight: 8 }}
          />
          <Typography variant="h6">Rito Games</Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {authenticatedUser ? (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Accueil
              </Button>
              {!isAdminMode && (
                <>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/team')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    Team
                  </Button>
                </>
              )}
              <>
                {isAdminMode && (
                  <Button
                    color="inherit"
                    onClick={() => navigate('/publishTournamentPage')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    Tournois
                  </Button>
                )}
                <Button
                  color="inherit"
                  onClick={() => navigate('/users')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Recherches
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate('/MyTournaments')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Mes tournois
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate(`/matches/${authenticatedUser.id}`)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Mes matchs
                </Button>
              </>

              <IconButton
                onClick={() => navigate('/notifications')}
                sx={{
                  color: 'white',
                  padding: '6px',
                  marginRight: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  },
                }}
              >
                <Badge
                  overlap="circular"
                  variant="dot"
                  invisible={!hasUnreadNotifications}
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: 'red',
                      height: '10px',
                      minWidth: '10px',
                      borderRadius: '50%',
                      top: 2,
                      right: 2,
                      boxShadow: '0 0 4px rgba(0,0,0,0.4)',
                    },
                  }}
                >
                  <NotificationsIcon sx={{ fontSize: 26 }} />
                </Badge>
              </IconButton>

              {isOriginalAdmin && (
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: isAdminMode ? '#1976d2' : 'black', // Couleur différente selon le mode
                    color: 'white',
                    fontWeight: 600,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center', // Centrer le contenu
                    gap: 1,
                    height: '40px', // Hauteur uniforme
                    padding: '0 16px', // Espacement horizontal
                    transition: 'background-color 0.3s ease', // Animation de transition
                    '&:hover': {
                      backgroundColor: isAdminMode ? '#115293' : '#333',
                    },
                    marginLeft: 'auto', // Aligner à droite si nécessaire
                  }}
                  onClick={() => {
                    toggleAdminMode();
                    navigate('/');
                  }}
                  aria-label={
                    isAdminMode
                      ? 'Passer en mode utilisateur'
                      : 'Passer en mode administrateur'
                  } // Accessibilité
                >
                  {isAdminMode ? (
                    <>
                      <AdminPanelSettingsIcon />{' '}
                      {/* Icône pour le mode admin */}
                      Mode User
                    </>
                  ) : (
                    <>
                      <PersonIcon /> {/* Icône pour le mode utilisateur */}
                      Mode Admin
                    </>
                  )}
                </Button>
              )}
              {/* Avatar + tag */}
              <Box
                sx={{ display: 'flex', alignItems: 'center', ml: 2, gap: 1 }}
              >
                {loadingProfile ? (
                  <CircularProgress size={24} color="inherit" />
                ) : user ? (
                  <>
                    <Avatar
                      src={resolveAvatarPath(user.picture)}
                      sx={{ width: 40, height: 40, cursor: 'pointer' }}
                      onClick={() => navigate('/profile')}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.2,
                        fontWeight: 500,
                        color: 'white', // Toujours blanc
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {isAdminMode && (
                        <Box
                          sx={{
                            background:
                              'linear-gradient(135deg, #8a2be2, #4c00ff)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: 'white',
                            letterSpacing: 0.6,
                            textTransform: 'uppercase',
                            boxShadow: '0 0 8px rgba(124, 0, 255, 0.5)',
                            animation: 'softPulse 2.4s infinite ease-in-out',
                            '@keyframes softPulse': {
                              '0%': {
                                boxShadow: '0 0 6px rgba(124, 0, 255, 0.3)',
                              },
                              '50%': {
                                boxShadow: '0 0 12px rgba(124, 0, 255, 0.7)',
                              },
                              '100%': {
                                boxShadow: '0 0 6px rgba(124, 0, 255, 0.3)',
                              },
                            },
                          }}
                        >
                          ADMIN
                        </Box>
                      )}

                      {user.tag}
                    </Typography>
                  </>
                ) : (
                  <Typography sx={{ color: 'white' }}>Utilisateur</Typography>
                )}
              </Box>

              <Button
                color="inherit"
                onClick={() => {
                  clearUser();
                  navigate('/');
                }}
                sx={{
                  minWidth: '38px',
                  height: '38px',
                  padding: 0,
                  borderRadius: '6px',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                <Logout sx={{ color: 'red' }} />
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Accueil
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/users')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Recherches
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/register')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                S'inscrire
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Se connecter
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
