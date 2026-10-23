import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useTeam } from './useTeam';
import { useLocation } from 'react-router-dom';
import * as teamService from '../services/team.service';

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(),
}));

vi.mock('../services/team.service', () => ({
  getTeamByUserId: vi.fn(),
  getUserById: vi.fn(),
  getTeamMembers: vi.fn(),
  quitTeam: vi.fn(),
  setResponsable: vi.fn(),
  setSecondResponsable: vi.fn(),
}));

describe('useTeam', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('uses team from location.state when present', async () => {
    (useLocation as ReturnType<typeof vi.fn>).mockReturnValue({
      state: {
        team: { id: 1, name: 'T', responsable: '10' },
      },
    });
    (teamService.getUserById as ReturnType<typeof vi.fn>).mockResolvedValue({
      tag: 'Resp',
    });
    (teamService.getTeamMembers as ReturnType<typeof vi.fn>).mockResolvedValue(
      [],
    );

    const { result } = renderHook(() =>
      useTeam({
        id: 10,
        mail: 'u@mail.com',
        password: 'pwd',
        token: 'token',
        tag: 'U',
        picture: '',
        speciality: {},
        role: 'USER',
        team: 1,
      }),
    );

    await waitFor(() => {
      expect(result.current.team?.id).toBe(1);
    });

    expect(teamService.getTeamByUserId).not.toHaveBeenCalled();
  });

  test('loads team from service when state is missing', async () => {
    (useLocation as ReturnType<typeof vi.fn>).mockReturnValue({ state: null });
    (teamService.getTeamByUserId as ReturnType<typeof vi.fn>).mockResolvedValue(
      {
        id: 5,
        name: 'A',
        responsable: '11',
        secondResponsable: '12',
      },
    );
    (teamService.getUserById as ReturnType<typeof vi.fn>).mockImplementation(
      (id: string | number) => {
        if (String(id) === '11') {
          return Promise.resolve({ tag: 'Resp', mail: 'resp@mail.com' });
        } else if (String(id) === '12') {
          return Promise.resolve({ tag: 'Second', mail: 'second@mail.com' });
        }
        return Promise.resolve(null);
      },
    );
    (teamService.getTeamMembers as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, mail: 'm@mail.com', role: 'USER' },
    ]);
    (teamService.setResponsable as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );

    const { result } = renderHook(() =>
      useTeam({
        id: 11,
        mail: 'u@mail.com',
        password: 'pwd',
        token: 'token',
        tag: 'U',
        picture: '',
        speciality: {},
        role: 'USER',
        team: 5,
      }),
    );

    await waitFor(() => {
      expect(result.current.team?.id).toBe(5);
    });

    await waitFor(() => {
      expect(result.current.responsableNom).toBe('Resp');
    });

    await waitFor(() => {
      expect(result.current.secondResponsableId).toBe(12);
    });

    expect(result.current.membres).toHaveLength(1);
  });

  test('handleQuitTeam sets team to null', async () => {
    const user = {
      id: 10,
      mail: 'u@mail.com',
      password: 'pwd',
      token: 'token',
      tag: 'U',
      picture: '',
      speciality: {},
      role: 'USER',
      team: 1,
    };

    (useLocation as ReturnType<typeof vi.fn>).mockReturnValue({ state: null });
    (teamService.getTeamByUserId as ReturnType<typeof vi.fn>).mockResolvedValue(
      {
        id: 1,
        name: 'T',
        responsable: '10',
      },
    );
    (teamService.getUserById as ReturnType<typeof vi.fn>).mockResolvedValue({
      tag: 'Resp',
    });
    (teamService.getTeamMembers as ReturnType<typeof vi.fn>).mockResolvedValue(
      [],
    );
    (teamService.quitTeam as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );

    const { result } = renderHook(() => useTeam(user));

    await waitFor(() => {
      expect(result.current.team?.id).toBe(1);
    });

    await act(async () => {
      await result.current.handleQuitTeam('token');
    });

    expect(teamService.quitTeam).toHaveBeenCalledWith(10, 'token');
    await waitFor(() => {
      expect(result.current.team).toBeNull();
    });
  });
});
