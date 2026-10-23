import avatar1 from '../assets/avatars/avatar1.jpg';
import avatar2 from '../assets/avatars/avatar2.jpg';
import avatar3 from '../assets/avatars/avatar3.jpg';
import avatar4 from '../assets/avatars/avatar4.jpg';
import avatar5 from '../assets/avatars/avatar5.avif';
import avatar6 from '../assets/avatars/avatar6.jpg';
import avatar7 from '../assets/avatars/avatar7.jpg';
import avatar8 from '../assets/avatars/avatar8.jpg';
import avatar9 from '../assets/avatars/avatar9.jpg';
import avatar10 from '../assets/avatars/avatar10.jpg';
import avatar11 from '../assets/avatars/avatar11.jpg';
import avatar12 from '../assets/avatars/avatar12.jpg';
import avatar13 from '../assets/avatars/avatar13.jpg';
import avatar14 from '../assets/avatars/avatar14.jpg';
import avatar15 from '../assets/avatars/avatar15.jpg';
import avatar16 from '../assets/avatars/avatar16.jpg';
import avatar17 from '../assets/avatars/avatar17.jpg';
import avatar18 from '../assets/avatars/avatar18.jpg';
import avatar19 from '../assets/avatars/avatar19.jpg';
import avatar20 from '../assets/avatars/avatar20.jpg';

export const AVATAR_STORAGE_PATHS = [
  '/src/assets/avatars/avatar1.jpg',
  '/src/assets/avatars/avatar2.jpg',
  '/src/assets/avatars/avatar3.jpg',
  '/src/assets/avatars/avatar4.jpg',
  '/src/assets/avatars/avatar5.avif',
  '/src/assets/avatars/avatar6.jpg',
  '/src/assets/avatars/avatar7.jpg',
  '/src/assets/avatars/avatar8.jpg',
  '/src/assets/avatars/avatar9.jpg',
  '/src/assets/avatars/avatar10.jpg',
  '/src/assets/avatars/avatar11.jpg',
  '/src/assets/avatars/avatar12.jpg',
  '/src/assets/avatars/avatar13.jpg',
  '/src/assets/avatars/avatar14.jpg',
  '/src/assets/avatars/avatar15.jpg',
  '/src/assets/avatars/avatar16.jpg',
  '/src/assets/avatars/avatar17.jpg',
  '/src/assets/avatars/avatar18.jpg',
  '/src/assets/avatars/avatar19.jpg',
  '/src/assets/avatars/avatar20.jpg',
] as const;

const avatarAssetUrls = [
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
  avatar7,
  avatar8,
  avatar9,
  avatar10,
  avatar11,
  avatar12,
  avatar13,
  avatar14,
  avatar15,
  avatar16,
  avatar17,
  avatar18,
  avatar19,
  avatar20,
] as const;

const storageToAsset = new Map<string, string>(
  AVATAR_STORAGE_PATHS.map((path, index) => [path, avatarAssetUrls[index]]),
);

const assetToStorage = new Map<string, string>(
  AVATAR_STORAGE_PATHS.map((path, index) => [avatarAssetUrls[index], path]),
);

const normalizeAvatarKey = (value: string): string => {
  let normalized = value.replace(/\\/g, '/').trim();

  // Keep only the pathname when a full URL is stored in DB.
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    try {
      normalized = new URL(normalized).pathname;
    } catch {
      // Fall back to raw value when URL parsing fails.
    }
  }

  if (normalized.startsWith('src/')) {
    normalized = `/${normalized}`;
  }

  return normalized;
};

const asPictureString = (
  picture?: string | { link?: string } | null,
): string => {
  if (!picture) {
    return '';
  }

  if (typeof picture === 'string') {
    return picture;
  }

  return picture.link ?? '';
};

export const resolveAvatarPath = (
  picture?: string | { link?: string } | null,
): string => {
  const rawValue = asPictureString(picture);
  if (!rawValue) {
    return '';
  }

  const normalized = normalizeAvatarKey(rawValue);
  return storageToAsset.get(normalized) ?? rawValue;
};

export const toAvatarStoragePath = (picture?: string | null): string => {
  if (!picture) {
    return '';
  }

  const normalized = normalizeAvatarKey(picture);
  return assetToStorage.get(normalized) ?? normalized;
};
