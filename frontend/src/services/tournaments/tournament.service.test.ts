import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  createTournament,
  getAllTournaments,
  getTournamentsById,
  getTournamentsByStatus,
  publishTournament,
  registerTeamToTournament,
  updateTournament,
  getTeamRegisteredTournaments,
  getTournamentRegistrationCounts,
} from './tournament.service';
import { NewTournament } from '../../types';

describe('tournament.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  const mockToken = 'Bearer test-token-123';

  const sampleTournament: NewTournament = {
    nom: 'Tournoi Test',
    description: 'Description du tournoi',
    date_debut: '2026-04-01T10:00:00',
    date_fin: '2026-04-05T18:00:00',
    date_fin_inscription: '2026-03-30T23:59:59',
    etat: 'draft',
    nbrTeam: 16,
    nbrTeamInscrite: 0,
  };

  test('getAllTournaments returns tournaments', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => [sampleTournament],
    });

    const result = await getAllTournaments();
    expect(globalThis.fetch).toHaveBeenCalledWith('api/tournaments/all');
    expect(result).toEqual([sampleTournament]);
  });

  test('getAllTournaments throws when request fails', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
    });

    await expect(getAllTournaments()).rejects.toThrow(
      'Erreur lors de la récupération des tournois',
    );
  });

  test('getTournamentsByStatus returns tournaments', async () => {
    const status = 'open';
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => [sampleTournament],
    });

    const result = await getTournamentsByStatus(status);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `api/tournaments/all/${status}`,
    );
    expect(result).toEqual([sampleTournament]);
  });

  test('getTournamentsByStatus throws when request fails', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
    });

    await expect(getTournamentsByStatus('open')).rejects.toThrow(
      'Erreur lors de la récupération des tournois',
    );
  });

  test('getTournamentsById returns a tournament', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => sampleTournament,
    });

    const result = await getTournamentsById(1);
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/tournaments/id/1');
    expect(result).toEqual(sampleTournament);
  });

  test('getTournamentsById throws when request fails', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
    });

    await expect(getTournamentsById(1)).rejects.toThrow(
      'Erreur lors de la récupération du tournoi',
    );
  });

  test('createTournament posts tournament', async () => {
    const createdTournament = { id: 1, ...sampleTournament };
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => createdTournament,
    });

    const result = await createTournament(sampleTournament, mockToken);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/tournaments',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: mockToken,
        },
        body: JSON.stringify(sampleTournament),
      }),
    );
    expect(result).toEqual(createdTournament);
  });

  test('createTournament throws backend text on failure', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
      text: async () => 'CREATE_TOURNAMENT_ERROR',
    });

    await expect(createTournament(sampleTournament, mockToken)).rejects.toThrow(
      'Erreur lors de la création du tournoi : CREATE_TOURNAMENT_ERROR',
    );
  });

  test('publishTournament patches tournament', async () => {
    const publishedTournament = {
      ...sampleTournament,
      etat: 'published',
      id: 1,
    };
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => publishedTournament,
    });

    const result = await publishTournament(1, mockToken);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/tournaments/publish/1',
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: mockToken,
        },
      }),
    );
    expect(result).toEqual(publishedTournament);
  });

  test('publishTournament throws backend text on failure', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
      text: async () => 'PUBLISH_ERROR',
    });

    await expect(publishTournament(1, mockToken)).rejects.toThrow(
      'Erreur lors de la sauvegarde du tournoi : PUBLISH_ERROR',
    );
  });

  test('updateTournament patches tournament', async () => {
    const updatedData = { ...sampleTournament, nom: 'Tournoi Modifié' };
    const updatedTournament = { ...updatedData, id: 1 };
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedTournament,
    });

    const result = await updateTournament(1, updatedData, mockToken);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/tournaments/1',
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: mockToken,
        },
        body: JSON.stringify(updatedData),
      }),
    );
    expect(result).toEqual(updatedTournament);
  });

  test('updateTournament throws backend text on failure', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
      text: async () => 'UPDATE_ERROR',
    });

    await expect(
      updateTournament(1, sampleTournament, mockToken),
    ).rejects.toThrow(
      'Erreur lors de la mise à jour du tournoi : UPDATE_ERROR',
    );
  });

  test('registerTeamToTournament posts registration', async () => {
    const registrationResponse = { success: true };
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => registrationResponse,
    });

    const result = await registerTeamToTournament(1, 2, 3, mockToken);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/inscriptiontournament/register/1/team/2',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: mockToken,
        },
        body: JSON.stringify({ teamId: 2, tournamentId: 1, userId: 3 }),
      }),
    );
    expect(result).toEqual(registrationResponse);
  });

  test('registerTeamToTournament throws backend text on failure', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
      text: async () => 'REGISTRATION_ERROR',
    });

    await expect(registerTeamToTournament(1, 2, 3, mockToken)).rejects.toThrow(
      "Erreur lors de l'inscription : REGISTRATION_ERROR",
    );
  });

  test('getTeamRegisteredTournaments filters tournaments', async () => {
    const inscriptions = [
      { tournament: { id: 1, ...sampleTournament } },
      { tournament: { id: 2, ...sampleTournament } },
      { tournament: undefined },
    ];
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => inscriptions,
    });

    const result = await getTeamRegisteredTournaments(10);
    expect(result).toEqual([
      { id: 1, ...sampleTournament },
      { id: 2, ...sampleTournament },
    ]);
  });

  test('getTeamRegisteredTournaments throws when request fails', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
    });

    await expect(getTeamRegisteredTournaments(10)).rejects.toThrow(
      "Erreur lors de la récupération des inscriptions de l'équipe",
    );
  });

  test('getTournamentRegistrationCounts returns counts', async () => {
    const counts = { 1: 5, 2: 3 };
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => counts,
    });

    const result = await getTournamentRegistrationCounts();
    expect(result).toEqual(counts);
  });

  test('getTournamentRegistrationCounts throws when request fails', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
    });

    await expect(getTournamentRegistrationCounts()).rejects.toThrow(
      "Erreur lors de la récupération du nombre d'inscriptions",
    );
  });
});
