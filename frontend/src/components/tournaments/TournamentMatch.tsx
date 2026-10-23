import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Stack,
  Typography,
  Divider,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import {
  useTournamentMatch,
  useGenerateTournamentMatches,
  useInitTeamTournament,
} from '../../hooks/tournaments/useTournamentMatch';
import { useTournamentMatchPage } from '../../hooks/tournaments/useTournamentMatchPage';
import { useTournamentPage } from '../../hooks/tournaments/useTournamentPage';
import { getMatchVisibility } from '../../hooks/useMatchVisibility';
import { useMatch } from '../../hooks/useMatch';
import { getAuthenticatedUser } from '../../utils/session';
import type { AuthenticatedUser, Match } from '../../types';
import { ArrowBack, ViewAgenda, ViewList } from '@mui/icons-material';

// Fonction utilitaire pour afficher le score
const getDisplayedScore = (match: Match, canSeeScore: boolean): string => {
  if (match.status === 'PLANNED') {
    return '---';
  }

  // Check if it's a forfeit (one score is -1)
  if (match.resultTeam1 === -1 || match.resultTeam2 === -1) {
    if (match.resultTeam1 === -1) {
      return `Forfait ${match.team2?.name || 'Équipe 2'} remporte le match`;
    }
    return `Forfait ${match.team1?.name || 'Équipe 1'} remporte le match`;
  }

  // Normal score display
  if (canSeeScore) {
    return `${match.resultTeam1 ?? '-'} - ${match.resultTeam2 ?? '-'}`;
  }

  return 'Score en attente de validation';
};

function TournamentMatch() {
  const navigate = useNavigate();
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const id = Number(tournamentId);
  const token = getAuthenticatedUser()?.token || '';
  const { matches, refetch } = useTournamentMatch(id, token);
  const { assignAdministrator } = useMatch(id, token);
  const { initializeMatches, isInitializing, error } =
    useGenerateTournamentMatches(Number.isNaN(id) ? 0 : id, token);
  const {
    handleInitializeTeams,
    isInitializing: isInitializingTeams,
    error: errorTeams,
  } = useInitTeamTournament(Number.isNaN(id) ? 0 : id, token);
  const sortedMatches = [...matches].sort((a, b) => a.turn - b.turn);
  const authenticatedUser: AuthenticatedUser | undefined =
    getAuthenticatedUser();
  const isAdmin = authenticatedUser?.role === 'ADMIN';
  const isAdminMode = sessionStorage.getItem('isAdminMode') === 'true';
  const { tournament } = useTournamentPage(tournamentId);
  const isRegistrationClosed = tournament?.date_fin_inscription
    ? new Date(tournament.date_fin_inscription) < new Date()
    : false;

  const {
    teamsInitialized,
    assigningAdmin,
    formatDateTime,
    handleAssignAdmin,
    markTeamsAsInitialized,
  } = useTournamentMatchPage(id);

  const [viewMode, setViewMode] = React.useState<'tree' | 'grouped'>('grouped');

  if (!tournamentId || Number.isNaN(id)) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography color="error">ID de tournoi invalide.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <IconButton
        aria-label="retour"
        onClick={() => navigate(-1)}
        size="large"
        sx={{ backgroundColor: '#f5f5f5', borderRadius: '50%' }}
      >
        <ArrowBack />
      </IconButton>
      <Box textAlign="center" mb={4}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, color: '#001f6d', mb: 1 }}
        >
          Matches du tournoi
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Cliquez sur un match pour voir ses details
        </Typography>
      </Box>

      {/* Bouton de switch de vue */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_e, newMode) => {
            if (newMode !== null) {
              setViewMode(newMode);
            }
          }}
          aria-label="view mode"
          sx={{
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
            p: 0.5,
          }}
        >
          <ToggleButton
            value="grouped"
            aria-label="vue groupée"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              '&.Mui-selected': {
                backgroundColor: '#001f6d',
                color: '#fff',
              },
            }}
          >
            <ViewList sx={{ mr: 1 }} />
            Vue groupée
          </ToggleButton>
          <ToggleButton
            value="tree"
            aria-label="vue arbre"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              '&.Mui-selected': {
                backgroundColor: '#001f6d',
                color: '#fff',
              },
            }}
          >
            <ViewAgenda sx={{ mr: 1 }} />
            Vue arbre
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        {isAdmin &&
        tournament?.etat === 'A_VENIR' &&
        isRegistrationClosed &&
        isAdminMode &&
        matches.length === 0 ? (
          <Button
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
            onClick={async () => {
              await initializeMatches(refetch);
            }}
            disabled={isInitializing}
          >
            {isInitializing ? 'Création en cours...' : 'Crée arbre des matches'}
          </Button>
        ) : null}

        {isAdmin &&
        isAdminMode &&
        matches.length > 0 &&
        tournament?.etat === 'A_VENIR' ? (
          <Button
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
            onClick={async () => {
              await handleInitializeTeams(refetch);
              markTeamsAsInitialized();
            }}
            disabled={isInitializingTeams || teamsInitialized}
          >
            {teamsInitialized
              ? 'Équipes déjà réparties'
              : isInitializingTeams
                ? 'Répartition en cours...'
                : 'Répartir les équipes'}
          </Button>
        ) : null}
      </Box>

      {(error || errorTeams) && (
        <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
          {error || errorTeams}
        </Typography>
      )}

      <Box sx={{ display: 'block' }}>
        {matches.length === 0 ? (
          <Typography textAlign="center" color="text.secondary">
            Aucun match trouve pour ce tournoi.
          </Typography>
        ) : viewMode === 'grouped' ? (
          /* VUE GROUPÉE */
          <Stack spacing={4}>
            {Array.from(new Set(sortedMatches.map((m) => m.turn)))
              .sort((a, b) => a - b)
              .map((turn) => {
                const matchesForTurn = sortedMatches.filter(
                  (m) => m.turn === turn,
                );
                return (
                  <Box key={`tour-${turn}`}>
                    {/* En-tête du tour */}
                    <Paper
                      elevation={0}
                      sx={{
                        backgroundColor: '#001f6d',
                        padding: '12px 16px',
                        marginBottom: 2,
                        borderRadius: '8px 8px 0 0',
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: '#fff',
                          letterSpacing: 0.5,
                        }}
                      >
                        Tour {turn}
                      </Typography>
                    </Paper>

                    {/* Matches du tour */}
                    <Box
                      sx={{
                        borderLeft: '4px solid #001f6d',
                        paddingLeft: 2,
                        paddingRight: 2,
                        paddingBottom: 2,
                        backgroundColor: '#f9f9f9',
                        borderRadius: '0 0 8px 8px',
                      }}
                    >
                      <Stack spacing={2}>
                        {matchesForTurn.map((m, idx) => {
                          const visibility = getMatchVisibility(
                            m,
                            authenticatedUser,
                          );
                          return (
                            <Box key={m.id}>
                              {idx > 0 && (
                                <Divider sx={{ my: 1.5, opacity: 0.3 }} />
                              )}
                              <Card
                                sx={{
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease-in-out',
                                  '&:hover': {
                                    boxShadow: 3,
                                    transform: 'translateX(4px)',
                                  },
                                }}
                                onClick={() =>
                                  navigate(
                                    `/tournamentmatches/${id}/match/${m.id}`,
                                  )
                                }
                              >
                                <CardContent>
                                  <Stack spacing={1}>
                                    <Typography
                                      variant="body1"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {m.team1?.name || 'Equipe 1'} vs{' '}
                                      {m.team2?.name || 'Equipe 2'}
                                    </Typography>
                                    <Typography variant="body2">
                                      Date : {formatDateTime(m.dateTime)}
                                    </Typography>

                                    <Typography variant="body2">
                                      Score :{' '}
                                      {getDisplayedScore(
                                        m,
                                        visibility.canSeeScore,
                                      )}
                                    </Typography>

                                    {isAdmin &&
                                      isAdminMode &&
                                      !m.administrator && (
                                        <Box sx={{ mt: 1 }}>
                                          <Button
                                            variant="contained"
                                            size="small"
                                            sx={{
                                              textTransform: 'none',
                                              fontWeight: 600,
                                              bgcolor: '#4caf50',
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleAssignAdmin(
                                                m.id,
                                                authenticatedUser?.id,
                                                assignAdministrator,
                                              );
                                              window.location.reload();
                                            }}
                                            disabled={assigningAdmin === m.id}
                                          >
                                            {assigningAdmin === m.id
                                              ? 'Assignation...'
                                              : "S'assigner arbitre"}
                                          </Button>
                                        </Box>
                                      )}

                                    {m.administrator && (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: '#4caf50',
                                          fontWeight: 600,
                                          display: 'block',
                                          mt: 1,
                                        }}
                                      >
                                        Arbitre : {m.administrator?.tag}
                                      </Typography>
                                    )}
                                  </Stack>
                                </CardContent>
                              </Card>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  </Box>
                );
              })}
          </Stack>
        ) : (
          /* VUE ARBRE TOURNOI */
          <Box
            sx={{
              width: '100%',
              overflowX: 'auto',
              pb: 4,
              position: 'relative',
            }}
          >
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <defs>
                <style>{`
                  .tournament-line {
                    stroke: #001f6d;
                    stroke-width: 2;
                    opacity: 0.3;
                  }
                `}</style>
              </defs>
              {/* Les lignes de connexion seront dessinées ici */}
            </svg>

            <Box
              sx={{
                display: 'flex',
                gap: 8,
                minWidth: 'max-content',
                px: 4,
                alignItems: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {Array.from(new Set(sortedMatches.map((m) => m.turn)))
                .sort((a, b) => a - b)
                .map((turn) => {
                  const matchesForTurn = sortedMatches.filter(
                    (m) => m.turn === turn,
                  );
                  return (
                    <Box
                      key={`col-tour-${turn}`}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        minWidth: 300,
                      }}
                    >
                      {/* En-tête du tour */}
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Paper
                          elevation={1}
                          sx={{
                            display: 'inline-block',
                            backgroundColor: '#001f6d',
                            color: '#fff',
                            px: 2.5,
                            py: 0.75,
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: '0.95em',
                          }}
                        >
                          Tour {turn}
                        </Paper>
                      </Box>

                      {/* Matches du tour avec connecteurs */}
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: matchesForTurn.length > 1 ? 8 : 0,
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        {matchesForTurn.map((m, idx) => {
                          const visibility = getMatchVisibility(
                            m,
                            authenticatedUser,
                          );
                          return (
                            <Box key={m.id} sx={{ position: 'relative' }}>
                              {/* Ligne de connexion avant le match */}
                              {matchesForTurn.length > 1 && idx > 0 && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    left: -20,
                                    top: '50%',
                                    width: 20,
                                    height: '1px',
                                    backgroundColor: '#001f6d',
                                    opacity: 0.3,
                                    transform: 'translateY(-50%)',
                                  }}
                                />
                              )}

                              <Card
                                sx={{
                                  width: '100%',
                                  minHeight: 130,
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease-in-out',
                                  border: '2px solid #001f6d',
                                  borderLeft: '5px solid #001f6d',
                                  backgroundColor: '#fff',
                                  position: 'relative',
                                  '&:hover': {
                                    boxShadow: 5,
                                    transform: 'translateX(4px)',
                                    backgroundColor: '#f8f9ff',
                                  },
                                }}
                                onClick={() =>
                                  navigate(
                                    `/tournamentmatches/${id}/match/${m.id}`,
                                  )
                                }
                              >
                                <CardContent sx={{ p: 1.5 }}>
                                  <Stack spacing={0.8}>
                                    {/* Team 1 */}
                                    <Box sx={{ pb: 0.6 }}>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 700,
                                          color: '#001f6d',
                                          fontSize: '0.9em',
                                          display: 'block',
                                          wordBreak: 'break-word',
                                        }}
                                      >
                                        {m.team1?.name || 'Équipe 1'}
                                      </Typography>
                                    </Box>

                                    {/* Score */}
                                    <Box
                                      sx={{
                                        textAlign: 'center',
                                        py: 1.2,
                                        backgroundColor: '#f0f4ff',
                                        borderRadius: 1.5,
                                        border: '1px solid #e0e8ff',
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          fontWeight: 700,
                                          fontSize: '1.15em',
                                          color: '#4caf50',
                                          letterSpacing: 0.5,
                                        }}
                                      >
                                        {getDisplayedScore(
                                          m,
                                          visibility.canSeeScore,
                                        )}
                                      </Typography>
                                    </Box>

                                    {/* Team 2 */}
                                    <Box sx={{ pt: 0.6 }}>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 700,
                                          color: '#001f6d',
                                          fontSize: '0.9em',
                                          display: 'block',
                                          wordBreak: 'break-word',
                                        }}
                                      >
                                        {m.team2?.name || 'Équipe 2'}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </CardContent>

                                {/* Connecteur de sortie */}
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    right: -20,
                                    top: '50%',
                                    width: 20,
                                    height: '2px',
                                    backgroundColor: '#001f6d',
                                    opacity: 0.5,
                                    transform: 'translateY(-50%)',
                                  }}
                                />
                              </Card>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  );
                })}
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default TournamentMatch;
