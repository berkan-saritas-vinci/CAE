import { useCallback, useEffect, useState } from 'react';
import { NewTournament, Tournament } from '../../types';
import {
  createTournament,
  getTournamentsByStatus,
  publishTournament,
  updateTournament,
} from '../../services/tournaments/tournament.service';
import { getAuthenticatedUser } from '../../utils/session';

export const useTournamentCreation = () => {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [dateFinInscription, setDateFinInscription] = useState('');
  const [nbrTeam, setNbrTeam] = useState('');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTournamentId, setEditingTournamentId] = useState<number | null>(
    null,
  );

  let user = getAuthenticatedUser();
  if (!user) {
    const storedUser = sessionStorage.getItem('authenticatedUser');
    user = storedUser ? JSON.parse(storedUser) : null;
  }

  const token = user?.token;

  const [minDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const fetchSavedTournaments = useCallback(async () => {
    try {
      const data = await getTournamentsByStatus('SAUVEGARDE');
      setTournaments(data);
    } catch (err) {
      console.error('Erreur lors du chargement des tournois sauvegardés', err);
      setTournaments([]);
    }
  }, []);

  useEffect(() => {
    fetchSavedTournaments();
  }, [fetchSavedTournaments]);

  const resetForm = useCallback(() => {
    setNom('');
    setDescription('');
    setDateDebut('');
    setDateFin('');
    setDateFinInscription('');
    setNbrTeam('');
    setEditingTournamentId(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!token) {
      alert('Non autorisé');
      return;
    }

    const parsedNbrTeam = Number(nbrTeam);

    if (
      !nom ||
      !description ||
      !dateDebut ||
      !dateFin ||
      !dateFinInscription ||
      nbrTeam === ''
    ) {
      alert('Tous les champs sont obligatoires');
      return;
    }

    if (!Number.isInteger(parsedNbrTeam) || parsedNbrTeam <= 0) {
      alert("Le nombre d'équipes doit être un entier positif");
      return;
    }

    if (new Date(dateDebut).getTime() < Date.now()) {
      alert('La date de début ne peut pas être dans le passée');
      return;
    }

    if (new Date(dateFin).getTime() < Date.now()) {
      alert('La date de fin ne peut pas être dans le passée');
      return;
    }

    if (new Date(dateFinInscription).getTime() < Date.now()) {
      alert('La date de fin d’inscription ne peut pas être dans le passée');
      return;
    }

    if (new Date(dateFinInscription) > new Date(dateDebut)) {
      alert('La date de fin d’inscription doit être avant la date de début');
      return;
    }

    if (new Date(dateDebut) > new Date(dateFin)) {
      alert('La date de début doit être avant la date de fin');
      return;
    }

    const tournamentPayload: NewTournament = {
      nom,
      description,
      date_debut: dateDebut,
      date_fin: dateFin,
      date_fin_inscription: dateFinInscription,
      etat: 'SAUVEGARDE',
      nbrTeam: parsedNbrTeam,
    };

    try {
      setLoading(true);

      if (editingTournamentId !== null) {
        await updateTournament(editingTournamentId, tournamentPayload, token);
        alert('Tournoi mis à jour avec succès !');
      } else {
        await createTournament(tournamentPayload, token);
        alert('Tournoi créé avec succès !');
      }

      resetForm();
      await fetchSavedTournaments();
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la sauvegarde du tournoi');
    } finally {
      setLoading(false);
    }
  }, [
    dateDebut,
    dateFin,
    dateFinInscription,
    description,
    editingTournamentId,
    fetchSavedTournaments,
    nbrTeam,
    nom,
    resetForm,
    token,
  ]);

  const handlePublish = useCallback(
    async (id: number) => {
      if (!token) {
        alert('Non autorisé');
        return;
      }

      try {
        await publishTournament(id, token);
        await fetchSavedTournaments();
      } catch (error) {
        console.error(error);
        alert('Impossible de publier le tournoi');
      }
    },
    [fetchSavedTournaments, token],
  );

  const handleEdit = useCallback((t: Tournament) => {
    setEditingTournamentId(t.id);
    setNom(t.nom);
    setDescription(t.description);
    setDateDebut(t.date_debut.slice(0, 10));
    setDateFin(t.date_fin.slice(0, 10));
    setDateFinInscription(t.date_fin_inscription.slice(0, 10));
    setNbrTeam(t.nbrTeam.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const formatDate = useCallback(
    (dateStr: string) => new Date(dateStr).toLocaleDateString('fr-FR'),
    [],
  );

  return {
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
  };
};
