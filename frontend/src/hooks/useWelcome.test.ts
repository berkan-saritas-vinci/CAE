import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useWelcome } from './useWelcome';
import {
  getTeamsWithMembers,
  envoyerDemandeWelcome,
  annulerDemandeWelcome,
  createTeamWelcome,
} from '../services/welcome.service';

vi.mock('../services/welcome.service', () => ({
  getTeamsWithMembers: vi.fn(),
  envoyerDemandeWelcome: vi.fn(),
  annulerDemandeWelcome: vi.fn(),
  createTeamWelcome: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('alert', vi.fn());
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('useWelcome', () => {
  it('initialise avec la vue home et aucune équipe', () => {
    const { result } = renderHook(() => useWelcome(1));

    expect(result.current.view).toBe('home');
    expect(result.current.teams).toEqual([]);
    expect(result.current.sentRequests).toEqual([]);
    expect(result.current.teamName).toBe('');
    expect(result.current.error).toBe('');
    expect(result.current.success).toBe(false);
  });

  it('charge les teams quand la vue passe à list-team', async () => {
    const teams = [
      { id: 1, name: 'Twice' },
      { id: 2, name: 'Aespa' },
    ];
    (getTeamsWithMembers as ReturnType<typeof vi.fn>).mockResolvedValue(teams);

    const { result } = renderHook(() => useWelcome(1));

    act(() => {
      result.current.setView('list-team');
    });

    await waitFor(() => {
      expect(result.current.teams).toEqual(teams);
    });

    expect(getTeamsWithMembers).toHaveBeenCalledOnce();
  });

  it('retourne un tableau vide si getTeamsWithMembers échoue', async () => {
    (getTeamsWithMembers as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Erreur'),
    );

    const { result } = renderHook(() => useWelcome(1));

    act(() => {
      result.current.setView('list-team');
    });

    await waitFor(() => {
      expect(result.current.teams).toEqual([]);
    });
  });

  it('envoie une demande et ajoute la team aux sentRequests', async () => {
    (envoyerDemandeWelcome as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );

    const { result } = renderHook(() => useWelcome(42));

    await act(async () => {
      await result.current.handleRequest(1, 'Twice');
    });

    expect(envoyerDemandeWelcome).toHaveBeenCalledWith(1, 42);
    expect(result.current.sentRequests).toContain(1);
    expect(globalThis.alert).toHaveBeenCalledWith(
      'Demande envoyée à la team : Twice',
    );
  });

  it('annule une demande et retire la team des sentRequests', async () => {
    (envoyerDemandeWelcome as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
    (annulerDemandeWelcome as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );

    const { result } = renderHook(() => useWelcome(42));

    await act(async () => {
      await result.current.handleRequest(1, 'Twice');
    });

    await act(async () => {
      await result.current.handleRequest(1, 'Twice');
    });

    expect(annulerDemandeWelcome).toHaveBeenCalledWith(1, 42);
    expect(result.current.sentRequests).not.toContain(1);
    expect(globalThis.alert).toHaveBeenCalledWith(
      'Demande annulée pour la team : Twice',
    );
  });

  it('affiche une alerte si handleRequest échoue', async () => {
    (envoyerDemandeWelcome as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Erreur'),
    );

    const { result } = renderHook(() => useWelcome(42));

    await act(async () => {
      await result.current.handleRequest(1, 'Twice');
    });

    expect(globalThis.alert).toHaveBeenCalledWith(
      'Impossible de traiter la demande, réessayez.',
    );
  });

  it('affiche une erreur si le nom de team est vide', async () => {
    const { result } = renderHook(() => useWelcome(42));

    await act(async () => {
      await result.current.handleCreateTeam();
    });

    expect(result.current.error).toBe('Le nom est obligatoire');
    expect(createTeamWelcome).not.toHaveBeenCalled();
  });

  it('crée une team et passe success à true', async () => {
    (createTeamWelcome as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      name: 'Twice',
    });
    vi.useFakeTimers();

    const { result } = renderHook(() => useWelcome(42));

    act(() => {
      result.current.setTeamName('Twice');
    });

    await act(async () => {
      await result.current.handleCreateTeam();
    });

    expect(createTeamWelcome).toHaveBeenCalledWith('Twice', 42);
    expect(result.current.success).toBe(true);

    vi.useRealTimers();
  });

  it('affiche une erreur si createTeamWelcome échoue', async () => {
    (createTeamWelcome as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Erreur'),
    );

    const { result } = renderHook(() => useWelcome(42));

    act(() => {
      result.current.setTeamName('Twice');
    });

    await act(async () => {
      await result.current.handleCreateTeam();
    });

    expect(result.current.error).toBe(
      'Impossible de créer la team, réessayez.',
    );
  });
});
