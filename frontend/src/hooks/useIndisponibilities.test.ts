import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useIndisponibilities } from './useIndisponibilities';
import {
  fetchIndisponibilities,
  createIndisponibility,
  deleteIndisponibility,
} from '../services/indisponibility.service';
import { useOutletContext } from 'react-router-dom';

vi.mock('react-router-dom', () => ({
  useOutletContext: vi.fn(),
}));

vi.mock('../services/indisponibility.service', () => ({
  fetchIndisponibilities: vi.fn(),
  createIndisponibility: vi.fn(),
  deleteIndisponibility: vi.fn(),
}));

describe('useIndisponibilities', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('loads and sorts periods', async () => {
    (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue({
      authenticatedUser: {
        id: 1,
        token: 'token',
      },
    });
    (fetchIndisponibilities as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 2, startDate: '2026-06-02', endDate: '2026-06-03' },
      { id: 1, startDate: '2026-06-01', endDate: '2026-06-02' },
    ]);

    const { result } = renderHook(() => useIndisponibilities());

    await waitFor(() => {
      expect(result.current.periods).toHaveLength(2);
    });

    expect(result.current.periods.map((p) => p.id)).toEqual([1, 2]);
  });

  test('addPeriod adds a period', async () => {
    (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue({
      authenticatedUser: {
        id: 1,
        token: 'token',
      },
    });
    (fetchIndisponibilities as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (createIndisponibility as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 10,
      startDate: '2026-07-01',
      endDate: '2026-07-02',
    });

    const { result } = renderHook(() => useIndisponibilities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addPeriod('2026-07-01', '2026-07-02');
    });

    expect(createIndisponibility).toHaveBeenCalledWith(
      1,
      'token',
      '2026-07-01',
      '2026-07-02',
    );
    expect(result.current.periods).toHaveLength(1);
  });

  test('removePeriod removes a period', async () => {
    (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue({
      authenticatedUser: {
        id: 1,
        token: 'token',
      },
    });
    (fetchIndisponibilities as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 10, startDate: '2026-07-01', endDate: '2026-07-02' },
    ]);
    (deleteIndisponibility as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );

    const { result } = renderHook(() => useIndisponibilities());

    await waitFor(() => {
      expect(result.current.periods).toHaveLength(1);
    });

    await act(async () => {
      await result.current.removePeriod(10);
    });

    expect(deleteIndisponibility).toHaveBeenCalledWith(10, 'token');
    expect(result.current.periods).toEqual([]);
  });
});
