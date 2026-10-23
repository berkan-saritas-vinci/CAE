import { Outlet } from 'react-router-dom';
import NavBar from '../Navbar/Navbar';
import { Alert, Box, Snackbar } from '@mui/material';
import { LoginContext } from '../../types';
import { useApp } from '../../hooks/useApp';

function App() {
  const {
    authenticatedUser,
    loginNotification,
    setLoginNotification,
    logoutNotification,
    setLogoutNotification,
    registrationNotification,
    setRegistrationNotification,
    loginError,
    setLoginError,
    registerUser,
    loginUser,
    clearUser,
  } = useApp();

  const fullLoginContext: LoginContext & { registerUser: typeof registerUser } =
    {
      loginUser,
      registerUser,
      authenticatedUser,
    };

  return (
    <div className="page">
      <Box width="100%">
        <NavBar authenticatedUser={authenticatedUser} clearUser={clearUser} />
      </Box>

      <Outlet context={fullLoginContext} />

      <Snackbar
        open={loginNotification}
        autoHideDuration={4000}
        onClose={() => setLoginNotification(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: '64px' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Connexion réussie
        </Alert>
      </Snackbar>

      <Snackbar
        open={logoutNotification}
        autoHideDuration={4000}
        onClose={() => setLogoutNotification(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: '64px' }}
      >
        <Alert severity="info" sx={{ width: '100%' }}>
          Déconnexion réussie
        </Alert>
      </Snackbar>

      <Snackbar
        open={registrationNotification}
        autoHideDuration={4000}
        onClose={() => setRegistrationNotification(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: '64px' }}
      >
        <Alert severity="info" sx={{ width: '100%' }}>
          Inscription réussie
        </Alert>
      </Snackbar>

      {loginError && (
        <Snackbar
          open={true}
          autoHideDuration={5000}
          onClose={() => setLoginError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ mt: '64px' }}
        >
          <Alert severity="error" sx={{ width: '100%' }}>
            {loginError}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
}

export default App;
