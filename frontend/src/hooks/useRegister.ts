import { useState, SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { emailChecker, passwordChecker } from '../utils/utils';
import { registerUser, RegisterError } from '../services/register.service';
import { AVATAR_STORAGE_PATHS } from '../utils/avatarPaths';

export const useRegister = () => {
  const navigate = useNavigate();

  const [picture, setPicture] = useState<string>(AVATAR_STORAGE_PATHS[0]);
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [tag, setTag] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [openAvatarDialog, setOpenAvatarDialog] = useState(false);
  const [mailError, setMailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setMailError('');
    setPasswordError('');

    if (!emailChecker(mail)) {
      setMailError('Veuillez entrez une adresse email valide');
      return;
    }

    if (!passwordChecker(password)) {
      setPasswordError(
        'Veuillez entrer un mot de passe contenant : au moins 8 caractères, un chiffre et un caractère spécial.',
      );
      return;
    }

    try {
      const user = await registerUser({
        picture,
        mail,
        password,
        tag,
        speciality,
        role: 'USER',
      });

      sessionStorage.setItem('pendingUser', JSON.stringify(user));
      navigate('/welcome');
    } catch (err) {
      if (err instanceof RegisterError) {
        if (err.status === 409) {
          setMailError('Cette adresse email existe déjà.');
          return;
        }

        if (err.status === 403) {
          setMailError(
            'Cette adresse email est bannie et ne peut pas être utilisée.',
          );
          return;
        }

        setMailError(err.message);
        return;
      }

      setMailError("Erreur lors de l'inscription. Réessaie plus tard.");
      console.error('Register error:', err);
    }
  };

  const handleMailInputChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setMail(input.value);
    setMailError('');
  };

  const handlePasswordInputChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setPassword(input.value);
    setPasswordError('');
  };

  const handleTagInputChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setTag(input.value);
  };

  return {
    picture,
    mail,
    password,
    tag,
    speciality,
    showPassword,
    openAvatarDialog,
    mailError,
    passwordError,

    setPicture,
    setSpeciality,
    setShowPassword,
    setOpenAvatarDialog,

    handleSubmit,
    handleMailInputChange,
    handlePasswordInputChange,
    handleTagInputChange,
  };
};
