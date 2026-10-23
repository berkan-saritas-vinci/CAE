import { useEffect, useState } from 'react';
import {
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Alert,
  IconButton,
  Container,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

import { useIndisponibilities } from '../../hooks/useIndisponibilities';

const IndisponibilityPage = () => {
  const navigate = useNavigate();

  const {
    periods,
    loading,
    error: loadError,
    addPeriod,
    removePeriod,
    refresh,
  } = useIndisponibilities();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError('Les deux dates sont obligatoires');
      return;
    }

    if (startDate > endDate) {
      setError('La date de début doit être avant la date de fin');
      return;
    }

    try {
      await addPeriod(startDate, endDate);
      setStartDate('');
      setEndDate('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('overlaps')) {
          setError('Cette période chevauche une période existante.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Une erreur inattendue est survenue.');
      }
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 5,
      }}
    >
      <Box
        sx={{
          width: '100%',
          p: 5,
          borderRadius: 3,
          backgroundColor: 'white',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {/* Bouton retour */}
        <IconButton
          aria-label="retour"
          onClick={() => navigate(-1)}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            backgroundColor: '#f5f5f5',
            '&:hover': { backgroundColor: '#e0e0e0' },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Header */}
        <Box textAlign="center">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: '#001f6d',
            }}
          >
            Mes indisponibilités
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Gérez vos périodes d'absence
          </Typography>
        </Box>

        {/* Formulaire */}
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Ajouter une période
          </Typography>

          <form onSubmit={handleSubmit} noValidate>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                mb: 3,
                flexWrap: 'wrap',
              }}
            >
              <TextField
                type="date"
                label="Date de début"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                required
                inputProps={{ min: minDate }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                type="date"
                label="Date de fin"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                required
                inputProps={{ min: minDate }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            {(error || loadError) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error || loadError}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: 600,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #001f6d, #0033a0)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00154d, #002277)',
                  transform: 'scale(1.03)',
                },
              }}
            >
              Ajouter la période
            </Button>
          </form>
        </Paper>

        {/* Table */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Mes périodes enregistrées
          </Typography>

          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: '#f8f9fa',
                  }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>Date début</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date fin</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {periods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Aucune période enregistrée
                    </TableCell>
                  </TableRow>
                ) : (
                  periods.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        {new Date(p.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(p.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          color="error"
                          sx={{
                            borderRadius: 2,
                            fontWeight: 500,
                          }}
                          onClick={() => removePeriod(p.id)}
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Container>
  );
};

export default IndisponibilityPage;
