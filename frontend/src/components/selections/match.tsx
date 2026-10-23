import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  Stack,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { LoginContext, Selection } from '../../types';
import { ArrowBack } from '@mui/icons-material';
import { getMatchVisibility } from '../../hooks/useMatchVisibility';
import { useMatch } from '../../hooks/useMatch';
import { useMatchDetail } from '../../hooks/useMatchDetail';
import { getAuthenticatedUser } from '../../utils/session';
import { getSelectionsByMatch } from '../../services/selection.service';

function Match() {
  const navigate = useNavigate();
  const { tournamentId, matchId } = useParams();
  const { authenticatedUser } = useOutletContext<LoginContext>();

  const parsedTournamentId = Number(tournamentId);
  const parsedMatchId = Number(matchId);

  const user = getAuthenticatedUser();
  const token = user?.token;
  const { teamValidate, teamContest, teamForfeit } = useMatch(
    parsedTournamentId,
    token,
  );

  const {
    match,
    isLoading,
    hasVoted,
    isSubmitting,
    formatDateTime,
    displayedScore,
    handleValidate,
    handleContest,
    handleForfeit,
  } = useMatchDetail(parsedTournamentId, parsedMatchId, authenticatedUser);

  // États pour les sélections
  const [team1Selections, setTeam1Selections] = useState<Selection[]>([]);
  const [team2Selections, setTeam2Selections] = useState<Selection[]>([]);
  const [loadingSelections, setLoadingSelections] = useState(false);

  const isAdminMode = sessionStorage.getItem('isAdminMode') === 'true';
  const isAdminInAdminMode = authenticatedUser?.role === 'ADMIN' && isAdminMode;
  const isAdminMatch =
    isAdminInAdminMode && match?.administrator?.id === user?.id;

  // Charger les sélections du match
  useEffect(() => {
    const fetchSelections = async () => {
      if (!matchId || !match) return;

      try {
        setLoadingSelections(true);
        const selections = await getSelectionsByMatch(Number(matchId));

        // Séparer les sélections par équipe en utilisant team.id
        const team1Sels = selections.filter(
          (s: Selection) => s.team?.id === match?.team1?.id,
        );
        const team2Sels = selections.filter(
          (s: Selection) => s.team?.id === match?.team2?.id,
        );

        setTeam1Selections(team1Sels);
        setTeam2Selections(team2Sels);
      } catch (error) {
        console.error('Erreur lors de la récupération des sélections:', error);
      } finally {
        setLoadingSelections(false);
      }
    };

    if (match) {
      fetchSelections();
    }
  }, [matchId, match]);

  // --- LOGIQUE DE VISIBILITÉ DES SCORES ---
  const { isResponsable, isSecondResponsable, canSeeScore } =
    getMatchVisibility(match, authenticatedUser);
  const canActAsTeamResponsible =
    (isResponsable || isSecondResponsable) && isAdminInAdminMode === false;

  if (!match) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error">Match introuvable.</Typography>
      </Container>
    );
  }

  const handleValidateClick = () => {
    const userTeamId = authenticatedUser?.team;
    handleValidate(teamValidate, userTeamId || 0);
  };

  const handleContestClick = () => {
    const userTeamId = authenticatedUser?.team;
    handleContest(teamContest, userTeamId || 0);
  };

  const handleForfeitClick = () => {
    const userTeamId = authenticatedUser?.team;
    handleForfeit(teamForfeit, userTeamId || 0);
  };

  return (
    <Container maxWidth="md" sx={{ minHeight: '90vh', py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
        }}
      >
        <IconButton
          aria-label="retour"
          onClick={() => navigate(-1)}
          size="large"
          sx={{ backgroundColor: '#f5f5f5', borderRadius: '50%' }}
        >
          <ArrowBack />
        </IconButton>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: '#001f6d',
            flex: 1,
            textAlign: 'center',
          }}
        >
          Détail du match
        </Typography>

        <Box sx={{ width: 40 }} />
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
        <CardContent>
          {isLoading ? (
            <Typography>Chargement...</Typography>
          ) : (
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {match.team1?.name} vs {match.team2?.name}{' '}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`Tour : ${match.turn}`} />
                <Chip label={`Statut : ${match.status}`} />
              </Stack>

              <Typography>
                <strong>Date :</strong> {formatDateTime(match.dateTime)}
              </Typography>

              <Typography>
                <strong>Statut :</strong> {match.status}
              </Typography>

              <Typography>
                <strong>Score :</strong> {displayedScore(match, canSeeScore)}
              </Typography>
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Actions possibles sur un match */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
        {isAdminInAdminMode &&
          isAdminMatch &&
          (match.status === 'PLANNED' ||
            match.status.includes('CONTESTED')) && (
            <Button
              variant="contained"
              fullWidth
              sx={{ textTransform: 'none', fontWeight: 600 }}
              onClick={() =>
                navigate(
                  `/tournamentmatches/${tournamentId}/match/${matchId}/manage`,
                )
              }
            >
              Encoder résultats
            </Button>
          )}
        {canActAsTeamResponsible && match.status === 'PLANNED' && (
          <Button
            variant="outlined"
            fullWidth
            sx={{ textTransform: 'none', fontWeight: 600 }}
            onClick={() => navigate(`/selectionMatch/${parsedMatchId}`)}
          >
            Selection match
          </Button>
        )}
        {canActAsTeamResponsible &&
          (match.status === 'TERMINED' ||
            match.status.includes('VALIDATE')) && (
            <>
              <Button
                variant="contained"
                fullWidth
                disabled={
                  hasVoted || isSubmitting || match.status.includes('CONTESTED')
                }
                sx={{ textTransform: 'none', fontWeight: 600 }}
                onClick={handleValidateClick}
              >
                {isSubmitting ? 'En cours...' : 'Valider le résultat'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                disabled={hasVoted || isSubmitting}
                sx={{ textTransform: 'none', fontWeight: 600 }}
                onClick={handleContestClick}
              >
                {isSubmitting ? 'En cours...' : 'Contester le résultat'}
              </Button>
            </>
          )}
        {canActAsTeamResponsible && match.status === 'PLANNED' && (
          <Button
            variant="outlined"
            color="warning"
            fullWidth
            disabled={isSubmitting}
            sx={{ textTransform: 'none', fontWeight: 600 }}
            onClick={handleForfeitClick}
          >
            {isSubmitting ? 'En cours...' : 'Déclarer forfait'}
          </Button>
        )}
      </Stack>

      {/* Tableaux des sélections */}
      {loadingSelections ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Équipe 1 */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, color: '#001f6d' }}
                >
                  Sélections {match?.team1?.name || 'Équipe 1'}
                </Typography>
                {team1Selections.length === 0 ? (
                  <Typography color="textSecondary">
                    Aucun joueur sélectionné
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>Membre</TableCell>
                        <TableCell>Email</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {team1Selections.map((selection) => (
                        <TableRow key={selection.id}>
                          <TableCell>
                            {selection.user?.tag ?? 'Sans tag'}
                          </TableCell>
                          <TableCell>{selection.user?.mail ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Équipe 2 */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, color: '#001f6d' }}
                >
                  Sélections {match?.team2?.name || 'Équipe 2'}
                </Typography>
                {team2Selections.length === 0 ? (
                  <Typography color="textSecondary">
                    Aucun joueur sélectionné
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>Membre</TableCell>
                        <TableCell>Email</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {team2Selections.map((selection) => (
                        <TableRow key={selection.id}>
                          <TableCell>
                            {selection.user?.tag ?? 'Sans tag'}
                          </TableCell>
                          <TableCell>{selection.user?.mail ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default Match;
