import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { LoginContext, DemandeAdhesion } from '../../types';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Stack,
  Divider,
  Alert,
  IconButton,
} from '@mui/material';
import type { ChipProps } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import { useDemandesAdhesion } from '../../hooks/useDemandesAdhesion';
import { ArrowBack } from '@mui/icons-material';

const statutColor = (statut: string): ChipProps['color'] => {
  if (statut === 'ACCEPTEE') return 'success';
  if (statut === 'REFUSEE') return 'error';
  return 'warning';
};

const statutLabel = (statut: string) => {
  if (statut === 'ACCEPTEE') return 'Acceptée';
  if (statut === 'REFUSEE') return 'Refusée';
  return 'En attente';
};

export default function DemandesAdhesionPage() {
  const { authenticatedUser } = useOutletContext<LoginContext>();
  const hookResult = useDemandesAdhesion();
  const { demandes, loading, error, handleAccepter, handleRefuser } =
    hookResult || {
      demandes: [],
      loading: false,
      error: null,
      handleAccepter: async () => {},
      handleRefuser: async () => {},
    };

  const [refusDialogOpen, setRefusDialogOpen] = useState(false);
  const [selectedDemandeId, setSelectedDemandeId] = useState<number | null>(
    null,
  );
  const [motifRefus, setMotifRefus] = useState('');
  const [motifError, setMotifError] = useState(false);
  const navigate = useNavigate();

  const openRefusDialog = (id: number) => {
    setSelectedDemandeId(id);
    setMotifRefus('');
    setMotifError(false);
    setRefusDialogOpen(true);
  };

  const confirmRefus = async () => {
    if (!motifRefus.trim()) {
      setMotifError(true);
      return;
    }
    if (selectedDemandeId === null) return;
    try {
      await handleRefuser(selectedDemandeId, motifRefus);
      setRefusDialogOpen(false);
    } catch {
      alert('Impossible de refuser la demande, réessayez.');
    }
  };

  if (authenticatedUser === undefined)
    return <Typography sx={{ p: 3 }}>Chargement...</Typography>;
  if (authenticatedUser === null)
    return <Typography sx={{ p: 3 }}>Vous devez être connecté.</Typography>;

  return (
    <Box sx={{ padding: 3, maxWidth: 800, margin: 'auto' }}>
      <IconButton
        onClick={() => navigate(-1)}
        size="large"
        sx={{
          backgroundColor: '#f5f5f5',
          borderRadius: '50%',
        }}
      >
        <ArrowBack />
      </IconButton>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Demandes d'adhésion
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gérez les demandes d'adhésion à votre équipe
      </Typography>

      {loading && <Typography>Chargement des demandes...</Typography>}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && demandes.length === 0 && (
        <Alert severity="info">Aucune demande d'adhésion pour le moment.</Alert>
      )}

      <Stack spacing={2}>
        {demandes.map((demande: DemandeAdhesion) => (
          <Card key={demande.id} variant="outlined">
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography fontWeight="bold">
                      {demande.user.mail}
                    </Typography>
                    {demande.user.tag && (
                      <Typography variant="body2" color="text.secondary">
                        @{demande.user.tag}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Chip
                  label={statutLabel(demande.statut)}
                  color={statutColor(demande.statut)}
                  size="small"
                />
              </Box>

              {demande.statut === 'REFUSEE' && demande.motifRefus && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" color="error">
                    <strong>Motif de refus :</strong> {demande.motifRefus}
                  </Typography>
                </>
              )}

              {demande.statut === 'EN_ATTENTE' && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Box
                    sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}
                  >
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckIcon />}
                      onClick={() => handleAccepter(demande.id)}
                    >
                      Accepter
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CloseIcon />}
                      onClick={() => openRefusDialog(demande.id)}
                    >
                      Refuser
                    </Button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Dialog
        open={refusDialogOpen}
        onClose={() => setRefusDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Motif de refus</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Veuillez indiquer la raison du refus de cette demande d'adhésion.
          </Typography>
          <TextField
            autoFocus
            label="Motif de refus"
            fullWidth
            multiline
            rows={3}
            value={motifRefus}
            onChange={(e) => {
              setMotifRefus(e.target.value);
              setMotifError(false);
            }}
            error={motifError}
            helperText={motifError ? 'Le motif de refus est obligatoire' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefusDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={confirmRefus}>
            Confirmer le refus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
