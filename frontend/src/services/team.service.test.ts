import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getTeamByUserId,
  getUserById,
  getTeamMembers,
  quitTeam,
  setSecondResponsable,
  createTeam,
  getTeamsWithMembers,
  envoyerDemande,
  annulerDemande,
} from './team.service';

vi.mock('./profile.service', () => ({
  getAuthHeaders: (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: token,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = vi.fn() as unknown as typeof fetch;
});

const mockResponse = (data: object | null, ok = true) => ({
  ok,
  json: async () => data,
});

const mockTeam = { id: 1, name: 'Twice', responsable: 'Dahyun' };

describe('getTeamByUserId', () => {
  it('retourne la team si la réponse est ok', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(mockTeam));

    const result = await getTeamByUserId(1);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/team/user/1', {
      headers: {},
    });
    expect(result).toEqual(mockTeam);
  });

  it('retourne null si la réponse est ko', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    const result = await getTeamByUserId(1);

    expect(result).toBeNull();
  });
});

describe('getUserById', () => {
  it("retourne l'utilisateur si la réponse est ok", async () => {
    const user = { id: 1, tag: 'Dahyun' };
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(user));

    const result = await getUserById(1);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/auths/users/1');
    expect(result).toEqual(user);
  });

  it('retourne null si la réponse est ko', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    const result = await getUserById(1);

    expect(result).toBeNull();
  });

  it('accepte un userId de type string', async () => {
    const user = { id: 1, tag: 'Dahyun' };
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(user));

    const result = await getUserById('Dahyun');

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/auths/users/Dahyun');
    expect(result).toEqual(user);
  });
});

describe('getTeamMembers', () => {
  it('retourne la liste des membres si la réponse est ok', async () => {
    const membres = [
      { id: 1, tag: 'Dahyun' },
      { id: 2, tag: 'Nayeon' },
    ];
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(membres));

    const result = await getTeamMembers(1);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/team/1/members', {
      headers: {},
    });
    expect(result).toEqual(membres);
  });

  it('retourne un tableau vide si la réponse est ko', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    const result = await getTeamMembers(1);

    expect(result).toEqual([]);
  });
});

describe('quitTeam', () => {
  it('appelle la bonne URL avec le bon token', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null));

    await quitTeam(1, 'mon-token');

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/team/user/1/quit', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'mon-token',
      },
    });
  });

  it('lance une erreur si la réponse est ko', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    await expect(quitTeam(1, 'mon-token')).rejects.toThrow(
      'Impossible de quitter la team',
    );
  });
});

describe('setSecondResponsable', () => {
  it('appelle la bonne URL avec le bon token', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null));

    await setSecondResponsable(1, 2, 'mon-token');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/team/1/second-responsable/2',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'mon-token',
        },
      },
    );
  });
});

describe('createTeam', () => {
  it('retourne la team créée si la réponse est ok', async () => {
    const newTeam = { name: 'Twice', responsable: 1 };
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(mockTeam));

    const result = await createTeam(newTeam);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/team', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTeam),
    });
    expect(result).toEqual(mockTeam);
  });

  it('lance une erreur si la réponse est ko', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    await expect(createTeam({ name: 'Twice', responsable: 1 })).rejects.toThrow(
      'Erreur création team',
    );
  });
});

describe('getTeamsWithMembers', () => {
  it('retourne la liste des teams si la réponse est ok', async () => {
    const teams = [mockTeam, { id: 2, name: 'Aespa', responsable: 'Karina' }];
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(teams));

    const result = await getTeamsWithMembers();

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/team/with-members');
    expect(result).toEqual(teams);
  });

  it('lance une erreur si la réponse est ko', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    await expect(getTeamsWithMembers()).rejects.toThrow(
      'Erreur récupération teams',
    );
  });
});

describe('envoyerDemande', () => {
  it('appelle la bonne URL', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null));

    await envoyerDemande(1, 2);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/adhesions/1?userId=2', {
      method: 'POST',
    });
  });

  it('lance une erreur si la réponse est ko', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    await expect(envoyerDemande(1, 2)).rejects.toThrow('Erreur envoi demande');
  });
});

describe('annulerDemande', () => {
  it('appelle la bonne URL', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null));

    await annulerDemande(1, 2);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/adhesions/1?userId=2', {
      method: 'DELETE',
    });
  });

  it('lance une erreur si la réponse est ko', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockResponse(null, false));

    await expect(annulerDemande(1, 2)).rejects.toThrow(
      'Erreur annulation demande',
    );
  });
});
