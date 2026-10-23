import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useTournamentCreation } from '../../hooks/tournaments/useTournamentCreation';

// Page permettant aux admin de créer des tournois
const PublishTournament = () => {
  const navigate = useNavigate();
  const {
    token,
    nom,
    setNom,
    description,
    setDescription,
    dateDebut,
    setDateDebut,
    dateFin,
    setDateFin,
    dateFinInscription,
    setDateFinInscription,
    nbrTeam,
    setNbrTeam,
    tournaments,
    loading,
    editingTournamentId,
    minDate,
    handleSave,
    handlePublish,
    handleEdit,
    resetForm,
    formatDate,
  } = useTournamentCreation();

  if (!token) {
    return <Alert severity="error">Non autorisé</Alert>;
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        py: 4,
      }}
    >
      {/* Bouton retour */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          position: 'absolute',
          top: 115,
          left: 300,
        }}
      >
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
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          gap: 4,
          mt: 6,
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'flex-start',
        }}
      >
        <Box
          sx={{
            width: { xs: '100%', md: '50%' },
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            p: 5,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            borderRadius: 3,
            backgroundColor: 'white',
          }}
        >
          <Typography
            variant="h4"
            textAlign="center"
            sx={{
              fontWeight: 600,
              color: '#001f6d',
            }}
          >
            Créer un tournoi
          </Typography>

          <TextField
            label="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            InputLabelProps={{ shrink: true }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <TextField
            label="Fin des inscriptions"
            type="date"
            value={dateFinInscription}
            onChange={(e) => setDateFinInscription(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: minDate }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <TextField
            label="Date de début"
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: minDate }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <TextField
            label="Date de fin"
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: minDate }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <TextField
            label="Nombre d'équipes"
            type="number"
            value={nbrTeam}
            onChange={(e) => setNbrTeam(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: 4, step: 1 }}
            error={Number(nbrTeam) < 4 && nbrTeam !== ''}
            helperText={
              Number(nbrTeam) < 4 && nbrTeam !== ''
                ? 'Minimum 4 équipes requises'
                : ''
            }
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <Button
            onClick={handleSave}
            disabled={loading || Number(nbrTeam) < 4}
            variant="contained"
            size="large"
            sx={{
              py: 1.5,
              fontWeight: 600,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #001f6d, #0033a0)',
              '&:hover': {
                background: 'linear-gradient(135deg, #00154d, #002277)',
                transform: 'scale(1.05)',
              },
            }}
          >
            {loading
              ? editingTournamentId !== null
                ? 'Enregistrement...'
                : 'Création...'
              : editingTournamentId !== null
                ? 'Mettre à jour'
                : 'Créer le tournoi'}
          </Button>
          {editingTournamentId !== null && (
            <Button
              onClick={resetForm}
              disabled={loading}
              variant="outlined"
              size="large"
              sx={{
                py: 1.5,
                fontWeight: 600,
                borderRadius: 3,
                borderColor: '#001f6d',
                color: '#001f6d',
              }}
            >
              Annuler
            </Button>
          )}
        </Box>

        {/* LISTE */}
        <Box sx={{ width: { xs: '100%', md: '50%' } }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, color: '#001f6d', mb: 2 }}
          >
            Tournois sauvegardés
          </Typography>

          {tournaments.length === 0 && (
            <Alert severity="info">Aucun tournoi sauvegardé</Alert>
          )}

          {tournaments.map((t) => (
            <Card
              key={t.id}
              sx={{
                mb: 2,
                borderRadius: 3,
                boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t.nom}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  {t.description}
                </Typography>

                <Typography variant="body2">
                  Début: {formatDate(t.date_debut)} | Fin:{' '}
                  {formatDate(t.date_fin)}
                </Typography>

                <Typography variant="body2">
                  Fin inscription: {formatDate(t.date_fin_inscription)}
                </Typography>

                <Typography variant="body2">
                  Nombre max d'equipes: {t.nbrTeam}
                </Typography>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  Statut: {t.etat}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    onClick={() => handleEdit(t)}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      color: '#001f6d',
                      borderColor: '#001f6d',
                    }}
                  >
                    Modifier
                  </Button>

                  <Button
                    onClick={() => handlePublish(t.id)}
                    variant="contained"
                    sx={{
                      borderRadius: 2,
                      background: '#001f6d',
                    }}
                  >
                    Publier
                  </Button>

                  <Button
                    onClick={() => navigate(`/tournamentPage/${t.id}`)}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  >
                    Voir
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default PublishTournament;
