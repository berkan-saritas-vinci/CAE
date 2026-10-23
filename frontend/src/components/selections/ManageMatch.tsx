import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { useMatch } from '../../hooks/useMatch';
import { useManageMatch } from '../../hooks/useManageMatch';
import { getAuthenticatedUser } from '../../utils/session';

function ManageMatch() {
  const navigate = useNavigate();
  const { matchId, tournamentId } = useParams();
  const parsedMatchId = Number(matchId);
  const parsedTournamentId = Number(tournamentId);

  const user = getAuthenticatedUser();
  const token = user?.token;

  const { matches, loading, adminEncode } = useMatch(parsedTournamentId, token);
  const { score1, setScore1, score2, setScore2, handleAdminEncode } =
    useManageMatch(adminEncode);

  const match = matches.find((m) => m.id === parsedMatchId);

  const isMatchDatePassed = match?.dateTime
    ? new Date(match.dateTime) <= new Date()
    : true;
  const isDrawResult = score1 === score2;

  const isAdmin = user && user.role === 'ADMIN';

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Chargement...</Typography>
      </Container>
    );
  }

  if (!match) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error">Match introuvable.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <IconButton
        onClick={() => navigate(-1)}
        size="large"
        sx={{ backgroundColor: '#f5f5f5', borderRadius: '50%', mb: 2 }}
      >
        <ArrowBack />
      </IconButton>

      <Stack spacing={3}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#001f6d' }}>
          Sélections du Match #{match?.id}
        </Typography>

        {/* Section administration - seulement pour les admins */}
        {isAdmin && (
          <>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: '#001f6d', mt: 4 }}
            >
              Informations et Actions Administrateur
            </Typography>

            <Card sx={{ borderRadius: 3, mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {match?.team1?.name} vs {match?.team2?.name}
                </Typography>

                <Stack direction="row" spacing={1} mt={2}>
                  <Chip label={`Tour : ${match?.turn}`} />
                  <Chip label={`Statut : ${match?.status}`} />
                </Stack>

                <Typography sx={{ mt: 2 }}>
                  <strong>Score actuel :</strong> {match?.resultTeam1 ?? '-'} -{' '}
                  {match?.resultTeam2 ?? '-'}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Encodage du résultat
                </Typography>

                {!isMatchDatePassed && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Le match n'a pas encore commencé. Les résultats ne pourront
                    être encodés qu'après la date du match (
                    {match?.dateTime &&
                      new Date(match.dateTime).toLocaleString('fr-BE')}
                    )
                  </Alert>
                )}

                {isDrawResult && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    Un match nul ne peut pas être encodé. Merci d'encoder un
                    score avec un vainqueur.
                  </Alert>
                )}

                <Stack spacing={2}>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Score équipe 1"
                      type="number"
                      value={score1}
                      onChange={(e) => setScore1(Number(e.target.value))}
                      disabled={!isMatchDatePassed}
                      inputProps={{ min: 0 }}
                    />
                    <TextField
                      label="Score équipe 2"
                      type="number"
                      value={score2}
                      onChange={(e) => setScore2(Number(e.target.value))}
                      disabled={!isMatchDatePassed}
                      inputProps={{ min: 0 }}
                    />
                  </Stack>

                  <Button
                    variant="contained"
                    onClick={async () => {
                      await handleAdminEncode(match!.id, user!.id);
                      navigate(-1);
                    }}
                    sx={{ textTransform: 'none' }}
                    disabled={!isMatchDatePassed || isDrawResult}
                  >
                    Encoder le résultat final
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </>
        )}
      </Stack>
    </Container>
  );
}

export default ManageMatch;
