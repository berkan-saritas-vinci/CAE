import { describe, test, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCreateTeam } from './useCreateTeam';
import { createTeam } from '../services/team.service';

vi.mock('../services/team.service', () => ({
  createTeam: vi.fn(),
}));

describe('useCreateTeam', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('throws an error when name is empty', async () => {
    const { result } = renderHook(() => useCreateTeam(1, 'token'));

    await expect(result.current.handleSubmit()).rejects.toThrow(
      'Veuillez entrer un nom de team',
    );
  });

  test('throws an error when user is not connected', async () => {
    const { result } = renderHook(() => useCreateTeam(undefined, undefined));

    act(() => {
      result.current.setTeamName('Twice');
    });

    await expect(result.current.handleSubmit()).rejects.toThrow(
      'Utilisateur non connecté',
    );
  });

  test('calls createTeam with correct payload', async () => {
    const created = { id: 10, name: 'Twice', responsable: '1' };
    (createTeam as ReturnType<typeof vi.fn>).mockResolvedValue(created);

    const { result } = renderHook(() => useCreateTeam(1, 'token'));

    act(() => {
      result.current.setTeamName('Twice');
    });

    const output = await result.current.handleSubmit();

    expect(createTeam).toHaveBeenCalledWith({ name: 'Twice', responsable: 1 });
    expect(output).toEqual(created);
  });
});
