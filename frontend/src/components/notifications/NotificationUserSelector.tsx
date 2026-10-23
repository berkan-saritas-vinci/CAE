import { useMemo } from 'react';
import {
  Autocomplete,
  Avatar,
  Box,
  TextField,
  Typography,
} from '@mui/material';
import { NotificationRecipient } from '../../services/notifications.service';
import { resolveAvatarPath } from '../../utils/avatarPaths';

interface NotificationRecipientSelectorProps {
  users: NotificationRecipient[];
  loadingUsers: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  targetUserId: number | null;
  setTargetUserId: (id: number | null) => void;
  selectedUser: NotificationRecipient | null;
}

function getPictureSrc(user: NotificationRecipient): string | undefined {
  return resolveAvatarPath(
    typeof user.picture === 'string' ? user.picture : user.picture?.link,
  );
}

function renderRoleBadge(role: NotificationRecipient['role']) {
  if (role === 'ADMIN') {
    return (
      <Box
        sx={{
          backgroundColor: 'black',
          color: 'red',
          px: 1,
          py: 0.3,
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
        }}
      >
        ADMIN
      </Box>
    );
  }

  if (role === 'BANNED') {
    return (
      <Box
        sx={{
          backgroundColor: 'red',
          color: 'white',
          px: 1,
          py: 0.3,
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
        }}
      >
        BANNI
      </Box>
    );
  }

  return null;
}

function NotificationRecipientSelector({
  users,
  loadingUsers,
  inputValue,
  setInputValue,
  targetUserId,
  setTargetUserId,
  selectedUser,
}: NotificationRecipientSelectorProps) {
  const filteredOptions = useMemo(
    () =>
      inputValue.trim() === ''
        ? users
        : users.filter((user) =>
            user.tag.toLowerCase().includes(inputValue.toLowerCase()),
          ),
    [inputValue, users],
  );

  return (
    <>
      <Autocomplete
        options={filteredOptions}
        loading={loadingUsers}
        getOptionLabel={(option) => option.tag}
        inputValue={inputValue}
        onInputChange={(_, value) => setInputValue(value)}
        noOptionsText="Aucun utilisateur"
        forcePopupIcon={false}
        filterOptions={(options) => options}
        onChange={(_, value) => {
          setTargetUserId(value?.id ?? null);
        }}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;

          return (
            <Box
              component="li"
              key={key}
              {...optionProps}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Avatar src={getPictureSrc(option)} />
              <Typography>{option.tag}</Typography>
              {renderRoleBadge(option.role)}
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Utilisateur destinataire (tag)"
            InputLabelProps={{ shrink: true }}
          />
        )}
      />

      {targetUserId && selectedUser && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: -1 }}>
          <Avatar src={getPictureSrc(selectedUser)} />
          <Typography sx={{ fontWeight: 600 }}>{selectedUser.tag}</Typography>
          {renderRoleBadge(selectedUser.role)}
        </Box>
      )}
    </>
  );
}

export default NotificationRecipientSelector;
