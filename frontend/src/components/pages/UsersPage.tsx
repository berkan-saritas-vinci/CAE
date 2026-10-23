import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  Paper,
  Container,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { LoginContext } from '../../types';
import { useUsersPage } from '../../hooks/useUsersPage';
import { resolveAvatarPath } from '../../utils/avatarPaths';

const UsersPage = () => {
  const { authenticatedUser } = useOutletContext<LoginContext>();
  const navigate = useNavigate();

  const token = authenticatedUser?.token ?? '';
  const isAdminMode = sessionStorage.getItem('isAdminMode') === 'true';
  const isAdminInAdminMode = authenticatedUser?.role === 'ADMIN' && isAdminMode;

  const {
    loading,
    error,
    searchTag,
    searchMode,
    updatingUserId,
    userToBan,
    filteredUsers,
    filteredTeams,
    setSearchTag,
    setSearchMode,
    setUserToBan,
    handleToggleRole,
    handleBan,
    getUserTagById,
  } = useUsersPage(token);

  const getPictureLink = (picture: string | { link: string }) =>
    resolveAvatarPath(
      typeof picture === 'string' ? picture : (picture?.link ?? ''),
    );

  return (
    <Container sx={{ mt: 5 }}>
      {/* Titre + interrupteur */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton
          aria-label="retour"
          onClick={() => navigate(-1)}
          size="large"
          sx={{ backgroundColor: '#f5f5f5', borderRadius: '50%' }}
        >
          <ArrowBack />
        </IconButton>

        <PeopleIcon sx={{ fontSize: 40, color: '#1976d2' }} />

        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          Gestion des utilisateurs
        </Typography>

        {/* Interrupteur User / Team */}
        <Box
          onClick={() => {
            setSearchMode(searchMode === 'USER' ? 'TEAM' : 'USER');
            setSearchTag('');
          }}
          sx={{
            ml: 3,
            width: 140,
            height: 45,
            background: 'linear-gradient(135deg, #e3e3e3 0%, #ffffff 100%)',
            borderRadius: '30px',
            border: '1px solid #d0d0d0',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            transition: '0.3s',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 3,
              left: searchMode === 'USER' ? 3 : 72,
              width: 65,
              height: 39,
              background: 'linear-gradient(135deg, #1976d2 0%, #4791db 100%)',
              borderRadius: '25px',
              transition: '0.25s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            }}
          />

          <Box
            sx={{
              width: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2,
              color: searchMode === 'USER' ? 'white' : '#555',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            User
          </Box>

          <Box
            sx={{
              width: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2,
              color: searchMode === 'TEAM' ? 'white' : '#555',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            Team
          </Box>
        </Box>
      </Box>

      {/* Champ de recherche */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label={
            searchMode === 'USER'
              ? 'Rechercher par tag'
              : 'Rechercher par nom de team'
          }
          value={searchTag}
          onChange={(e) => setSearchTag(e.target.value)}
          fullWidth
        />
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* MODE TEAM */}
          {searchMode === 'TEAM' &&
            filteredTeams.map((team) => (
              <Paper
                key={team.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  p: 2,
                  cursor: 'pointer',
                  transition: '0.2s',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    transform: 'scale(1.01)',
                  },
                }}
                onClick={() =>
                  navigate(`/publicTeam/${team.id}`, { state: { team } })
                }
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {team.name}
                </Typography>

                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Responsable : {getUserTagById(Number(team.responsable))}
                </Typography>
              </Paper>
            ))}

          {/* MODE USER */}
          {searchMode === 'USER' &&
            filteredUsers.map((user) => (
              <Paper
                key={user.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  cursor: 'pointer',
                  transition: '0.2s',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    transform: 'scale(1.01)',
                  },
                }}
                onClick={() => navigate(`/publicPage/${user.id}`)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={getPictureLink(user.picture)} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{user.tag}</Typography>

                    {/* BADGE ADMIN */}
                    {user.role === 'ADMIN' && (
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

                    {/* BADGE BANNI */}
                    {user.role === 'BANNED' && (
                      <Box
                        sx={{
                          backgroundColor: 'red',
                          color: 'white',
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
                        BANNI
                      </Box>
                    )}
                  </Box>
                </Box>

                {isAdminInAdminMode && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {user.role !== 'ADMIN' && user.role !== 'BANNED' && (
                      <Button
                        color="error"
                        variant="outlined"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUserToBan(user);
                        }}
                      >
                        Bannir
                      </Button>
                    )}

                    {user.role !== 'BANNED' && (
                      <Button
                        variant="contained"
                        color={user.role === 'ADMIN' ? 'error' : 'success'}
                        disabled={updatingUserId === user.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleRole(user);
                        }}
                      >
                        {user.role === 'ADMIN'
                          ? 'Retirer Admin'
                          : 'Attribuer Admin'}
                      </Button>
                    )}
                  </Box>
                )}
              </Paper>
            ))}

          {/* Aucun résultat */}
          {searchMode === 'USER' && filteredUsers.length === 0 && (
            <Typography>Aucun utilisateur trouvé</Typography>
          )}

          {searchMode === 'TEAM' && filteredTeams.length === 0 && (
            <Typography>Aucune team trouvée</Typography>
          )}
        </Box>
      )}

      {/* Popup bannissement */}
      {userToBan && (
        <Paper
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            p: 3,
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="h6">
            Voulez-vous vraiment bannir {userToBan.tag} ?
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={() => setUserToBan(null)}>
              Annuler
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleBan(userToBan)}
            >
              Bannir
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default UsersPage;
