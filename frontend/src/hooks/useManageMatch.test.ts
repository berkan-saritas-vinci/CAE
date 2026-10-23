import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useManageMatch } from './useManageMatch';

describe('useManageMatch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('initialise les scores à zéro', () => {
    const { result } = renderHook(() => useManageMatch(vi.fn()));

    expect(result.current.score1).toBe(0);
    expect(result.current.score2).toBe(0);
  });

  it('envoie un dto correct à adminEncode', async () => {
    const adminEncode = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useManageMatch(adminEncode));

    act(() => {
      result.current.setScore1(3);
      result.current.setScore2(2);
    });

    await act(async () => {
      await result.current.handleAdminEncode(12, 42);
    });

    expect(adminEncode).toHaveBeenCalledWith(12, {
      resultTeam1: 3,
      resultTeam2: 2,
      administratorId: 42,
    });
  });
});
