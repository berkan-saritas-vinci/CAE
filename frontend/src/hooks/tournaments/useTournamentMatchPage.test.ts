import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTournamentMatchPage } from './useTournamentMatchPage';

describe('useTournamentMatchPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  it('initialise teamsInitialized depuis sessionStorage', () => {
    sessionStorage.setItem('tournament_5_teams_initialized', 'true');

    const { result } = renderHook(() => useTournamentMatchPage(5));

    expect(result.current.teamsInitialized).toBe(true);
  });

  it('formate une date valide en français', () => {
    const { result } = renderHook(() => useTournamentMatchPage(5));

    const formatted = result.current.formatDateTime('2026-06-01T15:30:00');

    expect(formatted).not.toBe('Date invalide');
    expect(formatted).toContain('01');
    expect(formatted).toContain('2026');
  });

  it('affiche une alerte si aucun adminId n est pas fourni', async () => {
    const alertSpy = vi
      .spyOn(globalThis, 'alert')
      .mockImplementation(() => undefined);
    const assignAdministrator = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useTournamentMatchPage(7));

    await act(async () => {
      await result.current.handleAssignAdmin(3, undefined, assignAdministrator);
    });

    expect(assignAdministrator).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Vous devez être connecté');
  });

  it('appelle assignAdministrator et réinitialise assigningAdmin', async () => {
    const alertSpy = vi
      .spyOn(globalThis, 'alert')
      .mockImplementation(() => undefined);
    const assignAdministrator = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useTournamentMatchPage(8));

    await act(async () => {
      await result.current.handleAssignAdmin(4, 11, assignAdministrator);
    });

    expect(assignAdministrator).toHaveBeenCalledWith(4, 11);
    expect(alertSpy).toHaveBeenCalledWith(
      'Vous avez été assigné comme arbitre du match !',
    );
    expect(result.current.assigningAdmin).toBeNull();
  });

  it('marque les équipes comme initialisées en sessionStorage', () => {
    const { result } = renderHook(() => useTournamentMatchPage(9));

    act(() => {
      result.current.markTeamsAsInitialized();
    });

    expect(sessionStorage.getItem('tournament_9_teams_initialized')).toBe(
      'true',
    );
    expect(result.current.teamsInitialized).toBe(true);
  });
});
