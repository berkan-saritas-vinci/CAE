import {
  Box,
  Container,
  Typography,
  TextField,
  MenuItem,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTournaments } from '../../hooks/tournaments/useTournament';
import { setTournamentState } from '../../services/tournaments/tournament.service';
import { getAuthenticatedUser } from '../../utils/session';

const HomePage = () => {
  const navigate = useNavigate();
  const {
    filterType,
    setFilterType,
    status,
    setStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    playerTag,
    setPlayerTag,
    teamName,
    setTeamName,
    tournaments,
    formatDate,
    isRegistrationDeadlinePassed,
  } = useTournaments();

  const now = new Date();
  now.toString();

  tournaments.map((tournament) => {
    if (
      tournament?.date_fin_inscription &&
      tournament.etat === 'INSCRIPTION_OUVERTE' &&
      new Date(tournament.date_fin_inscription) < new Date(now)
    ) {
      console.log(
        "Date limite d'inscription dépassée, mise à jour du statut du tournoi",
      );
      setTournamentState(tournament.id, getAuthenticatedUser()?.token);
    }
  });

  return (
    <Container maxWidth="md" sx={{ minHeight: '90vh', py: 6 }}>
      <Box textAlign="center" mb={5}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, color: '#001f6d', mb: 1 }}
        >
          Tournois
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Trouvez et filtrez facilement vos tournois
        </Typography>
      </Box>

      {/* Filtre */}
      <Box
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          backgroundColor: 'white',
        }}
      >
        <ToggleButtonGroup
          value={filterType}
          exclusive
          onChange={(_, value) => value && setFilterType(value)}
          fullWidth
          sx={{ mb: 3 }}
        >
          <ToggleButton value="STATUS">Statut</ToggleButton>
          <ToggleButton value="PERIOD">Période</ToggleButton>
          <ToggleButton value="PLAYER">Joueur</ToggleButton>
          <ToggleButton value="TEAM">Team</ToggleButton>
        </ToggleButtonGroup>

        <Stack spacing={2}>
          {filterType === 'STATUS' && (
            <TextField
              select
              label="Statut"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="ALL">Tous</MenuItem>
              <MenuItem value="INSCRIPTION_OUVERTE">
                Inscription ouverte
              </MenuItem>
              <MenuItem value="EN_COURS">En cours</MenuItem>
              <MenuItem value="TERMINE">Terminé</MenuItem>
              <MenuItem value="A_VENIR">À venir</MenuItem>
            </TextField>
          )}

          {filterType === 'PERIOD' && (
            <>
              <TextField
                type="date"
                label="Date début"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                label="Date fin"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}

          {filterType === 'PLAYER' && (
            <TextField
              label="Tag joueur"
              value={playerTag}
              onChange={(e) => setPlayerTag(e.target.value)}
              fullWidth
            />
          )}

          {filterType === 'TEAM' && (
            <TextField
              label="Nom de team"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              fullWidth
            />
          )}
        </Stack>
      </Box>

      {/* Liste des tournois */}
      {tournaments.length === 0 ? (
        <Typography textAlign="center" color="text.secondary">
          Aucun tournoi trouvé
        </Typography>
      ) : (
        <Stack spacing={2}>
          {tournaments.map((t) => (
            <Card
              key={t.id}
              sx={{
                borderRadius: 3,
                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                transition: '0.2s',
                '&:hover': { transform: 'scale(1.02)' },
              }}
            >
              <CardActionArea
                onClick={() => navigate(`/tournamentPage/${t.id}`)}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {t.nom}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', mb: 1 }}
                      >
                        {t.description}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip label={`Début : ${formatDate(t.date_debut)}`} />
                        <Chip label={`Fin : ${formatDate(t.date_fin)}`} />
                        {t.etat === 'INSCRIPTION_OUVERTE' && (
                          <Chip
                            label={`Date limite : ${formatDate(t.date_fin_inscription)}`}
                            sx={{
                              backgroundColor: isRegistrationDeadlinePassed(
                                t.date_fin_inscription,
                              )
                                ? '#ffebee'
                                : '#e8f5e9',
                              color: isRegistrationDeadlinePassed(
                                t.date_fin_inscription,
                              )
                                ? '#b71c1c'
                                : '#2e7d32',
                            }}
                          />
                        )}
                      </Stack>
                    </Box>

                    <Chip
                      label={t.etat}
                      sx={{
                        fontWeight: 600,
                        color:
                          t.etat === 'INSCRIPTION_OUVERTE'
                            ? '#2e7d32'
                            : t.etat === 'A_VENIR'
                              ? '#ef6c00'
                              : t.etat === 'EN_COURS'
                                ? '#1565c0'
                                : '#616161',
                        backgroundColor:
                          t.etat === 'INSCRIPTION_OUVERTE'
                            ? '#e8f5e9'
                            : t.etat === 'A_VENIR'
                              ? '#fff3e0'
                              : t.etat === 'EN_COURS'
                                ? '#e3f2fd'
                                : '#eeeeee',
                        borderRadius: 1,
                        px: 1.5,
                        py: 0.5,
                        alignSelf: 'flex-start',
                        ml: 'auto',
                      }}
                    />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default HomePage;
