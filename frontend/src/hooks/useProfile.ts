import { useEffect, useState, useCallback } from 'react';
import { AuthenticatedUser, MaybeAuthenticatedUser } from '../types';
import {
  fetchProfile,
  fetchProfilePictures,
  fetchUserTeam,
  ProfileApiUser,
  ProfilePicture,
  updatePassword,
  updateProfile,
} from '../services/profile.service';

type EditableField = 'speciality' | 'avatar' | 'password';

/* ----------------------------- Helpers ----------------------------- */

type SpecialityObject = {
  speciality?: string;
  name?: string;
};

const getSpecialityLabel = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;

  if (typeof value === 'object') {
    const specialityObject = value as SpecialityObject;
    return specialityObject.speciality || specialityObject.name || '';
  }

  return '';
};

const formatCreationDate = (createdAt?: string) => {
  if (!createdAt) return 'Date inconnue';
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? createdAt
    : date.toLocaleDateString('fr-FR');
};

/* ----------------------- Hook: Save Feedback ----------------------- */

const useSaveFeedback = () => {
  const [saveMessage, setSaveMessage] = useState('');
  const [fieldChecks, setFieldChecks] = useState({
    speciality: false,
    avatar: false,
    password: false,
  });

  const trigger = (field: EditableField) => {
    setSaveMessage('Profil mis à jour');
    setFieldChecks((prev) => ({ ...prev, [field]: true }));

    setTimeout(() => {
      setFieldChecks((prev) => ({ ...prev, [field]: false }));
      setSaveMessage('');
    }, 3000);
  };

  return { saveMessage, fieldChecks, trigger, setSaveMessage };
};

/* ----------------------------- Main Hook ----------------------------- */

export const useProfile = (authenticatedUser?: MaybeAuthenticatedUser) => {
  const userId = authenticatedUser?.id;
  const token = authenticatedUser?.token;

  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState('');

  const [speciality, setSpeciality] = useState(
    getSpecialityLabel(authenticatedUser?.speciality),
  );
  const [team, setTeam] = useState(authenticatedUser?.team || '');
  const [avatar, setAvatar] = useState(
    typeof authenticatedUser?.picture === 'string'
      ? authenticatedUser.picture
      : '',
  );

  const [pictures, setPictures] = useState<ProfilePicture[]>([]);

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [editPassword, setEditPassword] = useState(false);
  const [editSpeciality, setEditSpeciality] = useState(false);
  const [openAvatarDialog, setOpenAvatarDialog] = useState(false);

  const {
    saveMessage,
    fieldChecks,
    trigger: triggerSaveFeedback,
    setSaveMessage,
  } = useSaveFeedback();

  /* ----------------------------- Loaders ----------------------------- */

  const loadProfile = useCallback(async () => {
    if (!userId) return setError('Utilisateur non connecté');

    setLoadingProfile(true);
    try {
      const data: ProfileApiUser = await fetchProfile(userId);
      const normalized = {
        ...data,
        createdAt: data.createdAt ?? data.creationDate,
      };

      setUser(normalized);
      setSpeciality(getSpecialityLabel(normalized.speciality));
      setAvatar(
        typeof normalized.picture === 'string' ? normalized.picture : '',
      );
      setError('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur récupération profil',
      );
    } finally {
      setLoadingProfile(false);
    }
  }, [userId]);

  const loadTeam = useCallback(async () => {
    if (!userId) return setTeam('Aucune team');

    try {
      const userTeam = await fetchUserTeam(userId);
      setTeam(userTeam.name || 'Aucune team');
    } catch {
      setTeam('Aucune team');
    }
  }, [userId]);

  const loadPictures = useCallback(async () => {
    try {
      const availablePictures = await fetchProfilePictures();
      setPictures(availablePictures);
    } catch (err) {
      console.error('Erreur chargement images :', err);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadTeam();
    loadPictures();
  }, [loadProfile, loadTeam, loadPictures]);

  /* ----------------------------- Save Field ----------------------------- */

  const saveField = useCallback(
    async (field: EditableField, value: string) => {
      if (!token) return setSaveMessage('Utilisateur non connecté');

      try {
        const updates =
          field === 'speciality' ? { speciality: value } : { picture: value };

        const updated = await updateProfile(token, updates);
        setUser((prev) => (prev ? { ...prev, ...updated } : prev));

        triggerSaveFeedback(field);
        return true;
      } catch (err) {
        setSaveMessage(
          err instanceof Error
            ? err.message
            : 'Erreur lors de la sauvegarde ❌',
        );
        setTimeout(() => setSaveMessage(''), 4000);
        return false;
      }
    },
    [token, triggerSaveFeedback, setSaveMessage],
  );

  /* ----------------------------- Actions ----------------------------- */

  const onSpecialityChange = async (value: string) => {
    setSpeciality(value);
    setUser((prev) => (prev ? { ...prev, speciality: value } : prev));
    const saved = await saveField('speciality', value);
    if (saved) setEditSpeciality(false);
  };

  const onAvatarSelect = async (value: string) => {
    setAvatar(value);
    const saved = await saveField('avatar', value);
    if (saved) setOpenAvatarDialog(false);
  };

  const onPasswordChange = async () => {
    try {
      if (!password || !newPassword)
        return setSaveMessage('Veuillez remplir tous les champs');

      if (newPassword.length < 6)
        return setSaveMessage(
          'Le nouveau mot de passe doit contenir au moins 6 caractères',
        );

      if (!token) throw new Error('Utilisateur non connecté');

      await updatePassword(token, password, newPassword);

      triggerSaveFeedback('password');
      setPassword('');
      setNewPassword('');
      setEditPassword(false);
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : 'Erreur serveur');
      setTimeout(() => setSaveMessage(''), 4000);
    }
  };

  /* ----------------------------- Return API ----------------------------- */

  return {
    user,
    team,
    avatar,
    speciality,
    pictures,
    error,
    saveMessage,
    loadingProfile,
    formattedCreationDate: formatCreationDate(user?.createdAt),

    password,
    newPassword,
    showPassword,
    editPassword,
    editSpeciality,
    openAvatarDialog,
    fieldChecks,

    setPassword,
    setNewPassword,
    setShowPassword,
    setEditPassword,
    setEditSpeciality,
    setOpenAvatarDialog,

    onSpecialityChange,
    onAvatarSelect,
    onPasswordChange,
    refreshProfile: loadProfile,
  };
};
