import { beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTournamentPage } from './useTournamentPage';
import { getTournamentsById } from '../../services/tournaments/tournament.service';
import {
  getTeamByUserId,
  getTeamsByTournamentId,
} from '../../services/tournaments/tournamentInscription.service';

vi.mock('../../services/tournaments/tournament.service', () => ({
  getTournamentsById: vi.fn(),
}));

vi.mock('../../services/tournaments/tournamentInscription.service', () => ({
  getTeamByUserId: vi.fn(),
  getTeamsByTournamentId: vi.fn(),
}));

describe('useTournamentPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  test('loads tournament and teams', async () => {
    const tournament = {
      id: 3,
      nom: 'Tournoi 3',
      description: 'Desc',
      date_debut: '2026-11-01T10:00:00',
      date_fin: '2026-11-03T10:00:00',
      date_fin_inscription: '2026-10-25T10:00:00',
      etat: 'INSCRIPTION_OUVERTE',
      nbrTeam: 8,
      nbrTeamInscrite: 2,
    };
    const teams = [{ id: 1, name: 'A', responsable: 7 }];

    (getTournamentsById as ReturnType<typeof vi.fn>).mockResolvedValue(
      tournament,
    );
    (getTeamsByTournamentId as ReturnType<typeof vi.fn>).mockResolvedValue(
      teams,
    );
    (getTeamByUserId as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 4,
      responsable: 7,
    });

    const { result } = renderHook(() =>
      useTournamentPage('3', {
        id: 7,
        mail: 'resp@mail.com',
        password: 'pwd',
        token: 'token-7',
        tag: 'Resp',
        picture: '',
        speciality: {},
        role: 'MEMBRE',
      }),
    );

    await waitFor(() => {
      expect(result.current.tournament?.id).toBe(3);
    });

    expect(getTournamentsById).toHaveBeenCalledWith(3);
    expect(getTeamsByTournamentId).toHaveBeenCalledWith(3);
    expect(result.current.teams).toEqual(teams);
    expect(result.current.registeredTeams).toBe(2);
    await waitFor(() => {
      expect(result.current.isTeamResponsible).toBe(true);
    });
  });

  test('isTeamResponsible is false without user', async () => {
    (getTournamentsById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 9,
      nom: 'Tournoi',
      description: 'Desc',
      date_debut: '2026-11-01T10:00:00',
      date_fin: '2026-11-03T10:00:00',
      date_fin_inscription: '2026-10-25T10:00:00',
      etat: 'INSCRIPTION_OUVERTE',
      nbrTeam: 8,
      nbrTeamInscrite: 0,
    });
    (getTeamsByTournamentId as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const { result } = renderHook(() => useTournamentPage('9', undefined));

    await waitFor(() => {
      expect(result.current.tournament?.id).toBe(9);
    });

    expect(result.current.isTeamResponsible).toBe(false);
    expect(getTeamByUserId).not.toHaveBeenCalled();
  });

  test('isTeamResponsible is true for RESPONSABLE role', async () => {
    (getTournamentsById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 6,
      nom: 'Tournoi',
      description: 'Desc',
      date_debut: '2026-11-01T10:00:00',
      date_fin: '2026-11-03T10:00:00',
      date_fin_inscription: '2026-10-25T10:00:00',
      etat: 'INSCRIPTION_OUVERTE',
      nbrTeam: 8,
      nbrTeamInscrite: 0,
    });
    (getTeamsByTournamentId as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (getTeamByUserId as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 99,
      responsable: 12,
    });

    const { result } = renderHook(() =>
      useTournamentPage('6', {
        id: 10,
        mail: 'resp@mail.com',
        password: 'pwd',
        token: 'token-10',
        tag: 'Resp10',
        picture: '',
        speciality: {},
        role: 'RESPONSABLE',
      }),
    );

    await waitFor(() => {
      expect(result.current.tournament?.id).toBe(6);
    });

    await waitFor(() => {
      expect(result.current.isTeamResponsible).toBe(true);
    });
  });
});
