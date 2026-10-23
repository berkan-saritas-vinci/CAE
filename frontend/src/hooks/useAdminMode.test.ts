import { describe, test, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAdminMode } from './useAdminMode';

describe('useAdminMode', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('reads initial value from sessionStorage', () => {
    sessionStorage.setItem('isAdminMode', 'true');

    const { result } = renderHook(() => useAdminMode());

    expect(result.current.isAdminMode).toBe(true);
  });

  test('toggleAdminMode toggles and persists value', () => {
    const { result } = renderHook(() => useAdminMode());

    expect(result.current.isAdminMode).toBe(false);

    act(() => {
      result.current.toggleAdminMode();
    });

    expect(result.current.isAdminMode).toBe(true);
    expect(sessionStorage.getItem('isAdminMode')).toBe('true');
  });

  test('disableAdminMode disables mode and clears sessionStorage', () => {
    sessionStorage.setItem('isAdminMode', 'true');
    const { result } = renderHook(() => useAdminMode());

    expect(result.current.isAdminMode).toBe(true);

    act(() => {
      result.current.disableAdminMode();
    });

    expect(result.current.isAdminMode).toBe(false);
    expect(sessionStorage.getItem('isAdminMode')).toBe(null);
  });

  test('disableAdminMode does nothing if already disabled', () => {
    const { result } = renderHook(() => useAdminMode());

    expect(result.current.isAdminMode).toBe(false);

    act(() => {
      result.current.disableAdminMode();
    });

    expect(result.current.isAdminMode).toBe(false);
    expect(sessionStorage.getItem('isAdminMode')).toBe(null);
  });
});
