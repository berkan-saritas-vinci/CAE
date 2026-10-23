import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  IconButton,
  Grid,
  Paper,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { LoginContext, NewTournament } from '../../types';
import { useRegisterTeamTournament } from '../../hooks/tournaments/useRegisterTeamTournament';

const OpenTournaments = () => {
  const navigate = useNavigate();
  const { authenticatedUser } = useOutletContext<LoginContext>();
  const {
    expandedTournamentId,
    toggleExpanded,
    availableTournaments,
    registeredTournaments,
    loading,
    inscriptionLoading,
    handleRegister,
    isAlreadyRegistered,
    getRegisteredCount,
    isFull,
    formatDate,
    hasEnoughMembers,
  } = useRegisterTeamTournament(authenticatedUser);

  if (!authenticatedUser) {
    return null;
  }

  const TournamentCard = ({
    tournament,
    isRegistered,
  }: {
    tournament: NewTournament & { id: number };
    isRegistered?: boolean;
  }) => (
    <Card
      sx={{
        mb: 2,
        borderRadius: 3,
        boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
        },
      }}
      onClick={() => toggleExpanded(tournament.id)}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {tournament.nom}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
          {tournament.description}
        </Typography>
        <Box sx={{ fontSize: '0.9rem', mb: 2 }}>
          <Typography variant="body2">
            📅 Début : {formatDate(tournament.date_debut)}
          </Typography>
          <Typography variant="body2">
            🏁 Fin : {formatDate(tournament.date_fin)}
          </Typography>
          {!isRegistered && (
            <Typography variant="body2">
              ⏳ Fin inscription : {formatDate(tournament.date_fin_inscription)}
            </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 1 }}>
            👥 Teams inscrites : {getRegisteredCount(tournament.id)} /{' '}
            {tournament.nbrTeam}
          </Typography>
        </Box>

        {!isRegistered && expandedTournamentId === tournament.id && (
          <Button
            variant="contained"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              handleRegister(tournament.id, authenticatedUser?.token);
            }}
            disabled={
              inscriptionLoading ||
              isAlreadyRegistered(tournament.id) ||
              isFull(tournament) ||
              !hasEnoughMembers
            }
            sx={{
              mt: 1,
              borderRadius: 2,
              background: isFull(tournament)
                ? '#ffffff'
                : 'linear-gradient(135deg, #001f6d, #0033a0)',
              color: isFull(tournament) ? '#000' : '#fff',
              '&:hover': {
                background: isFull(tournament)
                  ? '#ffffff'
                  : 'linear-gradient(135deg, #00154d, #002277)',
              },
              '&.Mui-disabled': {
                background: isFull(tournament) ? '#ffffff' : '#ccc',
                color: isFull(tournament) ? '#000' : '#666',
              },
            }}
          >
            {inscriptionLoading
              ? 'Inscription...'
              : isAlreadyRegistered(tournament.id)
                ? 'Déjà inscrit'
                : isFull(tournament)
                  ? 'Complet'
                  : !hasEnoughMembers
                    ? 'Moins de 4 membres'
                    : "S'inscrire"}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        py: 4,
      }}
    >
      {/* Bouton retour */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          mb: 3,
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          size="large"
          sx={{ backgroundColor: '#f5f5f5', borderRadius: '50%' }}
        >
          <ArrowBack />
        </IconButton>
      </Box>
      {loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Chargement des tournois...</Typography>
        </Box>
      )}

      {!loading && (
        <Grid container spacing={3}>
          {/* Colonne 1: Tournois disponibles */}
          <Grid item xs={12} sm={6} md={6}>
            <Paper
              sx={{
                p: 2.5,
                backgroundColor: '#f9f9f9',
                borderRadius: 3,
                height: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#001f6d',
                  mb: 2,
                  pb: 1.5,
                  borderBottom: '2px solid #001f6d',
                }}
              >
                Tournois disponibles
              </Typography>

              {availableTournaments.length === 0 ? (
                <Alert severity="info">
                  Aucun tournoi disponible à l'inscription
                </Alert>
              ) : (
                <Box sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {availableTournaments.map((t) => (
                    <TournamentCard
                      key={t.id}
                      tournament={t}
                      isRegistered={false}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Colonne 2: Historique - Tournois inscrits */}
          <Grid item xs={12} sm={6} md={6}>
            <Paper
              sx={{
                p: 2.5,
                backgroundColor: '#f0fff0',
                borderRadius: 3,
                height: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1b5e20',
                  mb: 2,
                  pb: 1.5,
                  borderBottom: '2px solid #1b5e20',
                }}
              >
                Historique de votre team
              </Typography>

              {registeredTournaments.length === 0 ? (
                <Alert severity="info">Aucune inscription pour le moment</Alert>
              ) : (
                <Box sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {registeredTournaments.map((t) => (
                    <TournamentCard
                      key={`registered-${t.id}`}
                      tournament={t}
                      isRegistered={true}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default OpenTournaments;
