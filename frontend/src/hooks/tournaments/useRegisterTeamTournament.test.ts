import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useRegisterTeamTournament } from './useRegisterTeamTournament';
import { useOpenTournaments } from './useOpenTournaments';

vi.mock('./useOpenTournaments', () => ({
  useOpenTournaments: vi.fn(),
}));

describe('useRegisterTeamTournament', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns only available tournaments', () => {
    (useOpenTournaments as ReturnType<typeof vi.fn>).mockReturnValue({
      tournaments: [
        {
          id: 1,
          nom: 'T1',
          description: 'Desc',
          date_debut: '2026-01-01T10:00:00',
          date_fin: '2026-01-02T10:00:00',
          date_fin_inscription: '2025-12-30T10:00:00',
          etat: 'INSCRIPTION_OUVERTE',
          nbrTeam: 8,
          nbrTeamInscrite: 2,
        },
        {
          id: 2,
          nom: 'T2',
          description: 'Desc',
          date_debut: '2026-01-03T10:00:00',
          date_fin: '2026-01-04T10:00:00',
          date_fin_inscription: '2026-01-01T10:00:00',
          etat: 'INSCRIPTION_OUVERTE',
          nbrTeam: 8,
          nbrTeamInscrite: 4,
        },
      ],
      registeredTournaments: [],
      loading: false,
      inscriptionLoading: false,
      handleRegister: vi.fn(),
      isAlreadyRegistered: (id: number) => id === 2,
      getRegisteredCount: () => 0,
    });

    const { result } = renderHook(() => useRegisterTeamTournament(undefined));

    expect(result.current.availableTournaments.map((t) => t.id)).toEqual([1]);
  });

  test('toggleExpanded opens then closes the same tournament', () => {
    (useOpenTournaments as ReturnType<typeof vi.fn>).mockReturnValue({
      tournaments: [],
      registeredTournaments: [],
      loading: false,
      inscriptionLoading: false,
      handleRegister: vi.fn(),
      isAlreadyRegistered: () => false,
      getRegisteredCount: () => 0,
    });

    const { result } = renderHook(() => useRegisterTeamTournament(undefined));

    act(() => {
      result.current.toggleExpanded(4);
    });
    expect(result.current.expandedTournamentId).toBe(4);

    act(() => {
      result.current.toggleExpanded(4);
    });
    expect(result.current.expandedTournamentId).toBeNull();
  });

  test('isFull compares registered count with capacity', () => {
    (useOpenTournaments as ReturnType<typeof vi.fn>).mockReturnValue({
      tournaments: [],
      registeredTournaments: [],
      loading: false,
      inscriptionLoading: false,
      handleRegister: vi.fn(),
      isAlreadyRegistered: () => false,
      getRegisteredCount: () => 8,
    });

    const { result } = renderHook(() => useRegisterTeamTournament(undefined));

    const tournament = {
      id: 99,
      nom: 'Complet',
      description: 'Desc',
      date_debut: '2026-01-01T10:00:00',
      date_fin: '2026-01-02T10:00:00',
      date_fin_inscription: '2025-12-30T10:00:00',
      etat: 'INSCRIPTION_OUVERTE',
      nbrTeam: 8,
      nbrTeamInscrite: 8,
    };

    expect(result.current.isFull(tournament)).toBe(true);
  });
});
