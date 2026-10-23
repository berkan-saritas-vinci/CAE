import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './components/App/App';
import LoginPage from './components/pages/loginPage';
import { CssBaseline } from '@mui/material';
import ProfilePage from './components/pages/ProfilePage';
import IndisponibilityPage from './components/pages/IndisponibilityPage';
import RegisterPage from './components/pages/RegistrationPage';
import NotificationPage from './components/notifications/NotificationPage';
import TeamPage from './components/pages/team';
import CreateTeamPage from './components/pages/createTeam';
import TeamsListPage from './components/pages/teamList';
import UsersPage from './components/pages/UsersPage';
import DemandesAdhesionPage from './components/pages/demandesAdhesion';
import WelcomePage from './components/pages/welcome';
import HomePage from './components/pages/HomePage';
import NotificationCreatePage from './components/notifications/NotificationCreatePage';
import PublicProfile from './components/pages/PublicProfile';
import PublishTournament from './components/tournaments/TournamentsCreationPage';
import TournamentPage from './components/tournaments/tournamentPage';
import RegisterTeamTournament from './components/tournaments/RegisterTeamTournament';
import MyTournaments from './components/tournaments/MyTournaments';
import PublicTeamPage from './components/pages/PublicTeamPage';
import TournamentMatch from './components/tournaments/TournamentMatch';
import SelectionMatch from './components/selections/SelectionMatch';
import Match from './components/selections/match';
import ManageMatch from './components/selections/ManageMatch';
import MatchUser from './components/selections/MatchUser';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'Login',
        element: <LoginPage />,
      },
      {
        path: 'Register',
        element: <RegisterPage />,
      },
      {
        path: 'Notifications',
        element: <NotificationPage />,
      },
      {
        path: 'Notifications/create',
        element: <NotificationCreatePage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'indisponibilities',
        element: <IndisponibilityPage />,
      },
      {
        path: 'Team',
        element: <TeamPage />,
      },
      {
        path: 'CreateTeam',
        element: <CreateTeamPage />,
      },
      {
        path: 'ListTeam',
        element: <TeamsListPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'Demandes',
        element: <DemandesAdhesionPage />,
      },
      {
        path: 'welcome',
        element: <WelcomePage />,
      },
      {
        path: 'publicPage/:userId',
        element: <PublicProfile />,
      },
      {
        path: 'tournamentPage/:tournamentId',
        element: <TournamentPage />,
      },
      {
        path: 'publishTournamentPage',
        element: <PublishTournament />,
      },
      {
        path: 'registerTeamTournament',
        element: <RegisterTeamTournament />,
      },
      {
        path: 'MyTournaments',
        element: <MyTournaments />,
      },
      {
        path: 'publicteam/:teamId',
        element: <PublicTeamPage />,
      },
      {
        path: 'tournamentmatches/:tournamentId',
        element: <TournamentMatch />,
      },
      {
        path: 'selectionMatch/:matchId',
        element: <SelectionMatch />,
      },
      {
        path: 'tournamentmatches/:tournamentId/match/:matchId',
        element: <Match />,
      },
      {
        path: 'tournamentmatches/:tournamentId/match/:matchId/manage',
        element: <ManageMatch />,
      },
      {
        path: 'matches/:userId',
        element: <MatchUser />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CssBaseline />
    <RouterProvider router={router} />
  </React.StrictMode>,
);

export default router;
