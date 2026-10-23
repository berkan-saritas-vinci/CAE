import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Grid,
  IconButton,
} from '@mui/material';
import { useSelectionMatch } from '../../hooks/useSelectionMatch';
import { ArrowBack } from '@mui/icons-material';

function SelectionMatch() {
  const { matchId } = useParams<{ matchId: string }>();
  const hookResult = useSelectionMatch(matchId);
  const navigate = useNavigate();

  if (!hookResult) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">
          Impossible de charger les données du match
        </Alert>
      </Container>
    );
  }

  const {
    isLoading,
    teamId,
    team1Data,
    team2Data,
    message,
    messageType,
    selectedMemberId,
    availableMembers,
    maxSelections,
    setSelectedMemberId,
    clearMessage,
    handleAddMember,
    handleRemoveMember,
  } = hookResult;

  // Déterminer les sélections de l'équipe actuelle
  const currentTeamSelections =
    teamId === team1Data.id ? team1Data.selections : team2Data.selections;

  if (isLoading) {
    return (
      <Container
        maxWidth="sm"
        sx={{ py: 4, display: 'flex', justifyContent: 'center' }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!teamId) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{message || 'Aucune équipe disponible'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <IconButton
        onClick={() => navigate(-1)}
        size="large"
        sx={{ backgroundColor: '#f5f5f5', borderRadius: '50%' }}
      >
        <ArrowBack />
      </IconButton>
      <Stack spacing={3}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#001f6d' }}>
          Sélection du Match
        </Typography>

        {message && (
          <Alert severity={messageType} onClose={clearMessage}>
            {message}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Ajouter des membres ({currentTeamSelections.length}/
              {maxSelections})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Membre</InputLabel>
                <Select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(String(e.target.value))}
                  label="Membre"
                  disabled={
                    availableMembers.length === 0 ||
                    currentTeamSelections.length >= maxSelections
                  }
                >
                  {availableMembers.map((member) => (
                    <MenuItem key={member.id} value={String(member.id)}>
                      {member.tag ?? member.mail}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={handleAddMember}
                disabled={
                  availableMembers.length === 0 ||
                  currentTeamSelections.length >= maxSelections
                }
              >
                Ajouter un membre
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: teamId === team1Data.id ? '#001f6d' : '#666',
                  }}
                >
                  {team1Data.name || 'Équipe 1'}
                  {teamId === team1Data.id && (
                    <Typography
                      component="span"
                      sx={{ ml: 1, color: '#4caf50', fontSize: '0.8em' }}
                    >
                      (Votre équipe)
                    </Typography>
                  )}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 2 }}
                >
                  Sélections: {team1Data.selections.length}/{maxSelections}
                </Typography>
                {team1Data.selections.length === 0 ? (
                  <Typography color="textSecondary">
                    Aucun joueur sélectionné
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>Membre</TableCell>
                        <TableCell>Email</TableCell>
                        {teamId === team1Data.id && (
                          <TableCell align="right">Action</TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {team1Data.selections.map((selection) => (
                        <TableRow key={selection.id}>
                          <TableCell>
                            {selection.user?.tag ?? 'Sans tag'}
                          </TableCell>
                          <TableCell>{selection.user?.mail ?? '-'}</TableCell>
                          {teamId === team1Data.id && (
                            <TableCell align="right">
                              <Button
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleRemoveMember(selection.user?.id || 0)
                                }
                              >
                                Retirer
                              </Button>
                            </TableCell>
                          )}
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
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: teamId === team2Data.id ? '#001f6d' : '#666',
                  }}
                >
                  {team2Data.name || 'Équipe 2'}
                  {teamId === team2Data.id && (
                    <Typography
                      component="span"
                      sx={{ ml: 1, color: '#4caf50', fontSize: '0.8em' }}
                    >
                      (Votre équipe)
                    </Typography>
                  )}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 2 }}
                >
                  Sélections: {team2Data.selections.length}/{maxSelections}
                </Typography>
                {team2Data.selections.length === 0 ? (
                  <Typography color="textSecondary">
                    Aucun joueur sélectionné
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>Membre</TableCell>
                        <TableCell>Email</TableCell>
                        {teamId === team2Data.id && (
                          <TableCell align="right">Action</TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {team2Data.selections.map((selection) => (
                        <TableRow key={selection.id}>
                          <TableCell>
                            {selection.user?.tag ?? 'Sans tag'}
                          </TableCell>
                          <TableCell>{selection.user?.mail ?? '-'}</TableCell>
                          {teamId === team2Data.id && (
                            <TableCell align="right">
                              <Button
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleRemoveMember(selection.user?.id || 0)
                                }
                              >
                                Retirer
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}

export default SelectionMatch;
