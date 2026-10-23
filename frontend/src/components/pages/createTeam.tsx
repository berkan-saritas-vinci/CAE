import { useNavigate, useOutletContext } from 'react-router-dom';
import { LoginContext } from '../../types';
import {
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  Container,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useCreateTeam } from '../../hooks/useCreateTeam';

export default function CreateTeamPage() {
  const navigate = useNavigate();
  const { authenticatedUser } = useOutletContext<LoginContext>();
  const { teamName, setTeamName, handleSubmit } = useCreateTeam(
    authenticatedUser?.id,
    authenticatedUser?.token,
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await handleSubmit();
      alert(`Team ${data.name} créée !`);
      navigate('/team', { state: { team: data } });
    } catch (err) {
      alert('Impossible de créer la team, réessayez.');
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          p: 4,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          borderRadius: 3,
          backgroundColor: 'white',
          position: 'relative',
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            backgroundColor: '#f5f5f5',
            borderRadius: '50%',
            '&:hover': { backgroundColor: '#e0e0e0' },
          }}
        >
          <ArrowBack />
        </IconButton>

        <Typography
          variant="h4"
          textAlign="center"
          sx={{ fontWeight: 600, color: '#001f6d', mt: 2 }}
        >
          Créer une team
        </Typography>

        <form onSubmit={onSubmit}>
          <TextField
            label="Nom de la team"
            fullWidth
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              py: 1.5,
              fontWeight: 600,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #001f6d, #0033a0)',
              color: '#fff',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #00154d, #002277)',
                transform: 'scale(1.03)',
              },
            }}
          >
            Créer la team
          </Button>
        </form>
      </Box>
    </Container>
  );
}
