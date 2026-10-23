import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useTournamentCreation } from './useTournamentCreation';
import {
  createTournament,
  getTournamentsByStatus,
  publishTournament,
  updateTournament,
} from '../../services/tournaments/tournament.service';
import { getAuthenticatedUser } from '../../utils/session';

vi.mock('../../services/tournaments/tournament.service', () => ({
  createTournament: vi.fn(),
  getTournamentsByStatus: vi.fn(),
  publishTournament: vi.fn(),
  updateTournament: vi.fn(),
}));

vi.mock('../../utils/session', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const getFutureDate = (daysToAdd: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
};

describe('useTournamentCreation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal('alert', vi.fn());
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  test('loads saved tournaments on mount', async () => {
    (getAuthenticatedUser as ReturnType<typeof vi.fn>).mockReturnValue({
      token: 'token-admin',
    });
    (getTournamentsByStatus as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      [],
    );

    renderHook(() => useTournamentCreation());

    await waitFor(() => {
      expect(getTournamentsByStatus).toHaveBeenCalledWith('SAUVEGARDE');
    });
  });

  test('handleSave creates a tournament then resets the form', async () => {
    (getAuthenticatedUser as ReturnType<typeof vi.fn>).mockReturnValue({
      token: 'token-admin',
    });
    (getTournamentsByStatus as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    (createTournament as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 1,
    });

    const { result } = renderHook(() => useTournamentCreation());

    await waitFor(() => {
      expect(getTournamentsByStatus).toHaveBeenCalledTimes(1);
    });

    const debut = getFutureDate(3);
    const fin = getFutureDate(5);
    const finInscription = getFutureDate(2);

    act(() => {
      result.current.setNom('Tournoi Hook');
      result.current.setDescription('Desc');
      result.current.setDateDebut(debut);
      result.current.setDateFin(fin);
      result.current.setDateFinInscription(finInscription);
      result.current.setNbrTeam('16');
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(createTournament).toHaveBeenCalledTimes(1);
    expect(globalThis.alert).toHaveBeenCalledWith('Tournoi créé avec succès !');
    expect(result.current.nom).toBe('');
    expect(result.current.nbrTeam).toBe('');
    expect(getTournamentsByStatus).toHaveBeenCalledTimes(2);
  });

  test('handlePublish publishes a tournament', async () => {
    (getAuthenticatedUser as ReturnType<typeof vi.fn>).mockReturnValue({
      token: 'token-admin',
    });
    (getTournamentsByStatus as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    (publishTournament as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 10,
    });

    const { result } = renderHook(() => useTournamentCreation());

    await waitFor(() => {
      expect(getTournamentsByStatus).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.handlePublish(10);
    });

    expect(publishTournament).toHaveBeenCalledWith(10, 'token-admin');
    expect(getTournamentsByStatus).toHaveBeenCalledTimes(2);
  });

  test('handleSave updates tournament in edit mode', async () => {
    (getAuthenticatedUser as ReturnType<typeof vi.fn>).mockReturnValue({
      token: 'token-admin',
    });

    const savedTournament = {
      id: 7,
      nom: 'Ancien',
      description: 'Ancienne desc',
      date_debut: '2026-10-10T10:00:00',
      date_fin: '2026-10-12T10:00:00',
      date_fin_inscription: '2026-10-01T10:00:00',
      etat: 'SAUVEGARDE',
      nbrTeam: 8,
      nbrTeamInscrite: 0,
    };

    (getTournamentsByStatus as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([savedTournament])
      .mockResolvedValueOnce([savedTournament]);
    (updateTournament as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ...savedTournament,
      nom: 'Nouveau nom',
    });

    const { result } = renderHook(() => useTournamentCreation());

    await waitFor(() => {
      expect(result.current.tournaments).toHaveLength(1);
    });

    act(() => {
      result.current.handleEdit(savedTournament);
      result.current.setNom('Nouveau nom');
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(updateTournament).toHaveBeenCalledTimes(1);
    expect(globalThis.alert).toHaveBeenCalledWith(
      'Tournoi mis à jour avec succès !',
    );
  });
});
