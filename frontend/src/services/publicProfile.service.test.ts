import { describe, it, beforeEach, expect, vi } from 'vitest';
import { getUserById, getTeamForUser } from './publicProfile.service';
import type { PublicUser } from './publicProfile.service';

globalThis.fetch = vi.fn();

describe('publicProfile.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserById', () => {
    it('retourne un utilisateur normalisé', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          id: 1,
          mail: 'test@mail.com',
          password: 'pwd',
          token: 'abc',
          tag: 'TestUser',
          picture: { link: 'img.png' },
          speciality: { speciality: 'Développeur' },
          creationDate: '2024-01-01',
          role: 'USER',
        }),
      };

      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse,
      );

      const user: PublicUser = await getUserById('1');

      expect(user.id).toBe(1);
      expect(user.speciality).toBe('Développeur');
      expect(user.picture).toEqual({ link: 'img.png' });
      expect(user.createdAt).toBe('2024-01-01');
    });

    it('utilise createdAt si présent', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          id: 2,
          mail: 'mail@mail.com',
          password: 'pwd',
          token: 'xyz',
          tag: 'User2',
          picture: 'avatar.png',
          speciality: { speciality: 'Designer' },
          createdAt: '2023-12-12',
        }),
      };

      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse,
      );

      const user = await getUserById('2');

      expect(user.createdAt).toBe('2023-12-12');
    });

    it('lève une erreur si la requête échoue', async () => {
      const mockResponse = { ok: false };

      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse,
      );

      await expect(getUserById('99')).rejects.toThrow(
        'Erreur récupération profil',
      );
    });

    it('utilise une image vide si aucune image n’est fournie', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          id: 3,
          mail: 'noimg@mail.com',
          password: 'pwd',
          token: 'tok',
          tag: 'NoImg',
          speciality: { speciality: 'Testeur' },
          // picture manquant
          creationDate: '2024-02-02',
        }),
      };

      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse,
      );

      const user = await getUserById('3');

      expect(user.picture).toBe('');
    });

    it('met createdAt à undefined si aucune date n’est fournie', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          id: 4,
          mail: 'nodate@mail.com',
          password: 'pwd',
          token: 'tok',
          tag: 'NoDate',
          picture: 'avatar.png',
          speciality: { speciality: 'Dev' },
          // ni createdAt ni creationDate
        }),
      };

      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse,
      );

      const user = await getUserById('4');

      expect(user.createdAt).toBeUndefined();
    });
  });

  describe('getTeamForUser', () => {
    it('retourne la team', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ name: 'Team Alpha' }),
      };

      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse,
      );

      const team = await getTeamForUser('1');

      expect(team.name).toBe('Team Alpha');
    });

    it('lève une erreur si la requête échoue', async () => {
      const mockResponse = { ok: false };

      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse,
      );

      await expect(getTeamForUser('1')).rejects.toThrow(
        'Erreur récupération team',
      );
    });
  });
});
